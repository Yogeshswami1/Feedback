import axios from "axios";
import Analysis from "../models/Analysis.js";

const YT_BASE = "https://www.googleapis.com/youtube/v3/commentThreads";
const HF_URL = "https://api-inference.huggingface.co/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english";

// small helper to extract videoId from url
function extractVideoId(urlOrId) {
  try {
    // if already an id (11 chars typical) return
    if (/^[A-Za-z0-9_-]{11}$/.test(urlOrId)) return urlOrId;
    const u = new URL(urlOrId);
    const v = u.searchParams.get("v");
    if (v) return v;
    // possible short URL youtu.be/<id>
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    return null;
  } catch (e) {
    return null;
  }
}

// fetch comments (paginated) up to maxComments
async function fetchComments(videoId, apiKey, maxComments = 200) {
  let comments = [];
  let pageToken = null;
  while (comments.length < maxComments) {
    const params = {
      part: "snippet",
      videoId,
      key: apiKey,
      maxResults: 100,
    };
    if (pageToken) params.pageToken = pageToken;
    const res = await axios.get(YT_BASE, { params });
    const items = res.data.items || [];
    for (const it of items) {
      const snippet = it.snippet?.topLevelComment?.snippet;
      if (snippet?.textDisplay) {
        comments.push(snippet.textDisplay);
        if (comments.length >= maxComments) break;
      }
    }
    pageToken = res.data.nextPageToken;
    if (!pageToken) break;
  }
  return comments;
}

// analyze single text via HF
async function analyzeTextHF(text, hfKey) {
  const resp = await axios.post(HF_URL, { inputs: text }, {
    headers: { Authorization: `Bearer ${hfKey}` },
    timeout: 20000
  });
  // model returns array; pick top
  const r = resp.data?.[0]?.[0];
  // r might be like { label: 'LABEL_0', score: 0.98 } or { label: 'NEGATIVE' ... }
  return r || null;
}

// concurrency-limited runner
async function analyzeBatch(texts, hfKey, concurrency = 5) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < texts.length) {
      const idx = i++;
      try {
        const r = await analyzeTextHF(texts[idx], hfKey);
        results[idx] = r;
      } catch (err) {
        console.error("HF error for text idx", idx, err?.message || err);
        results[idx] = null;
      }
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, texts.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export const analyzeVideoComments = async (req, res) => {
  try {
    const { urlOrId } = req.body;
    const videoId = extractVideoId(urlOrId);
    if (!videoId) return res.status(400).json({ error: "Invalid YouTube URL or ID" });

    const YT_KEY = process.env.YOUTUBE_API_KEY;
    const HF_KEY = process.env.HF_API_KEY;
    const maxComments = parseInt(process.env.MAX_COMMENTS || "200", 10);
    const concurrency = parseInt(process.env.CONCURRENCY || "5", 10);

    // 1) fetch comments
    const comments = await fetchComments(videoId, YT_KEY, maxComments);
    if (!comments.length) return res.status(200).json({ message: "No comments found", count: 0 });

    // 2) analyze in batches with concurrency
    const hfResults = await analyzeBatch(comments, HF_KEY, concurrency);

    // map label normalization helper
    const labelMap = {
      LABEL_0: "NEGATIVE",
      LABEL_1: "NEUTRAL",
      LABEL_2: "POSITIVE",
      label_0: "NEGATIVE",
      label_1: "NEUTRAL",
      label_2: "POSITIVE"
    };

    const saved = [];
    for (let i = 0; i < comments.length; i++) {
      const r = hfResults[i];
      let label = r?.label || "NEUTRAL";
      label = labelMap[label] || label; // normalize if needed
      const score = typeof r?.score === "number" ? r.score : 0;
      const analysis = new Analysis({
        videoId,
        postText: comments[i],
        sentiment: label,
        score
      });
      await analysis.save();
      saved.push(analysis);
    }

    // return summary counts
    const summary = saved.reduce((acc, a) => {
      const key = (a.sentiment || "NEUTRAL").toUpperCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    res.json({ message: "Analyzed comments", videoId, count: saved.length, summary });
  } catch (error) {
    console.error("YouTube analyze error:", error?.response?.data || error.message || error);
    res.status(500).json({ error: "Failed to analyze comments" });
  }
};

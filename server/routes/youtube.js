import express from "express";
import axios from "axios";
import Sentiment from "sentiment";
import Analysis from "../models/Analysis.js";

const router = express.Router();
const sentiment = new Sentiment();

// GET YouTube video ID from URL
function extractVideoId(url) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes("youtu.be")) {
      return parsedUrl.pathname.slice(1);
    }
    return parsedUrl.searchParams.get("v");
  } catch {
    return null;
  }
}

router.post("/youtube-comments", async (req, res) => {
  const { url } = req.body;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "YouTube API key not configured" });
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return res.status(400).json({ error: "Invalid YouTube video link" });
  }

  try {
    let comments = [];
    let pageToken = "";

    // Fetch first 50 comments (can extend to more with loop)
    const ytRes = await axios.get(
      "https://www.googleapis.com/youtube/v3/commentThreads",
      {
        params: {
          part: "snippet",
          videoId,
          maxResults: 50,
          key: apiKey,
        },
      }
    );

    ytRes.data.items.forEach((item) => {
      const text = item.snippet.topLevelComment.snippet.textDisplay;
      comments.push(text);
    });

    // Analyze comments
    const results = [];
    for (let comment of comments) {
      const analysis = sentiment.analyze(comment);
      let sentimentLabel = "neutral";
      if (analysis.score > 0) sentimentLabel = "positive";
      else if (analysis.score < 0) sentimentLabel = "negative";

      results.push({
        postText: comment,
        sentiment: sentimentLabel,
        score: Math.abs(analysis.score / 10), // normalize score
        createdAt: new Date(),
      });
    }

    // Save to MongoDB
    await Analysis.insertMany(results);

    res.json({
      message: "YouTube comments analyzed successfully",
      count: results.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch YouTube comments" });
  }
});
router.delete('/comments', async (req, res) => {
      console.log("Delete route hit, body:", req.body);

  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'IDs array is required' });
  }
  try {
    await Analysis.deleteMany({ _id: { $in: ids } });
    res.json({ message: 'Deleted successfully', deletedCount: ids.length });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete comments' });
  }
});

export default router;

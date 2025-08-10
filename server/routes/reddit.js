import express from "express";
import axios from "axios";
import Sentiment from "sentiment";
import Analysis from "../models/Analysis.js";

const router = express.Router();
const sentiment = new Sentiment();

function extractRedditPostId(url) {
  try {
    const parsedUrl = new URL(url);
    const paths = parsedUrl.pathname.split("/");
    const commentsIndex = paths.indexOf("comments");
    if (commentsIndex !== -1 && paths.length > commentsIndex + 1) {
      return paths[commentsIndex + 1];
    }
    return null;
  } catch {
    return null;
  }
}

router.post("/reddit-comments", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Reddit post URL is required" });
  }

  const postId = extractRedditPostId(url);
  if (!postId) {
    return res.status(400).json({ error: "Invalid Reddit post URL" });
  }

  try {
    const redditRes = await axios.get(`https://www.reddit.com/comments/${postId}.json`);
    const comments = redditRes.data[1].data.children
      .map((c) => c.data.body)
      .filter(Boolean);

    const results = comments.map((comment) => {
      const analysis = sentiment.analyze(comment);
      let sentimentLabel = "neutral";
      if (analysis.score > 0) sentimentLabel = "positive";
      else if (analysis.score < 0) sentimentLabel = "negative";

      return {
        postText: comment,
        sentiment: sentimentLabel,
        score: Math.abs(analysis.score / 10), // normalize score
        createdAt: new Date(),
      };
    });

    await Analysis.insertMany(results);

    res.json({
      message: "Reddit comments analyzed successfully",
      count: results.length,
    });
  } catch (error) {
    console.error("Reddit comments error:", error);
    res.status(500).json({ error: "Failed to fetch or analyze Reddit comments" });
  }
});

export default router;

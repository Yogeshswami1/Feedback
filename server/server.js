// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import connectDB from "./config/db.js";
// import feedbackRoutes from "./routes/feedbackRoutes.js";

// dotenv.config();
// connectDB();

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.use("/api/feedback", feedbackRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import youtubeRoutes from "./routes/youtube.js";
import Analysis from "./models/Analysis.js"; // ✅ Sirf import, dobara define nahi
import redditRoutes from "./routes/reddit.js";

dotenv.config();

const app = express();
// app.use(cors());

app.use(cors({
  origin: 'http://feedback.yogeshtech.xyz',
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use(express.json());
app.use("/api", youtubeRoutes);
app.use("/api", redditRoutes);


// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// API endpoint for sentiment analysis
app.post('/api/analyze', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Text is required' });

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english',
      { inputs: text },
      { headers: { Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}` } }
    );
    const result = response.data[0][0];
    const newAnalysis = new Analysis({
      postText: text,
      sentiment: result.label,
      score: result.score
    });
    await newAnalysis.save();
    res.json({ sentiment: result.label, score: result.score });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Sentiment analysis failed' });
  }
});

app.get('/api/analyses', async (req, res) => {
  try {
    const analyses = await Analysis.find().sort({ createdAt: -1 });
    res.json(analyses);
  } catch (error) {
    console.error('Fetch analyses error:', error);
    res.status(500).json({ error: 'Failed to fetch analyses' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import Feedback from "../models/Feedback.js";
import axios from "axios";

export const submitFeedback = async (req, res) => {
  try {
    const { name, feedback } = req.body;

    // HuggingFace API call
    const hfResponse = await axios.post(
      "https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment",
      { inputs: feedback },
      { headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` } }
    );

    // Debugging ke liye raw response dekh
    console.log("HF API Raw Response:", JSON.stringify(hfResponse.data, null, 2));

    // Map HuggingFace labels to schema labels
    const labelMap = {
      LABEL_0: "negative",
      LABEL_1: "neutral",
      LABEL_2: "positive",
      label_0: "negative", // lowercase case
      label_1: "neutral",
      label_2: "positive"
    };

    let sentimentLabel = "neutral";
    let confidenceScore = null;

    if (hfResponse.data && Array.isArray(hfResponse.data[0])) {
      const sorted = hfResponse.data[0].sort((a, b) => b.score - a.score);
      const rawLabel = sorted[0].label;
      sentimentLabel = labelMap[rawLabel] || "neutral";
      confidenceScore = sorted[0].score;
    }

    const newFeedback = new Feedback({
      name,
      feedback,
      sentiment: sentimentLabel
    });

    await newFeedback.save();

    res.status(201).json({
      message: "Feedback submitted",
      data: newFeedback,
      score: confidenceScore
    });
  } catch (error) {
    console.error("Feedback Error:", error?.response?.data || error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};

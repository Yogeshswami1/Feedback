import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  feedback: { type: String, required: true },
  sentiment: { type: String, enum: ["positive", "negative", "neutral"], required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Feedback", feedbackSchema);

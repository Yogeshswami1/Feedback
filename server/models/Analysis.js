// import mongoose from "mongoose";

// const AnalysisSchema = new mongoose.Schema({
//   source: { type: String, default: "youtube" },
//   videoId: String,
//   postText: String,
//   sentiment: String,
//   score: Number,
//   createdAt: { type: Date, default: Date.now }
// });

// export default mongoose.model("Analysis", AnalysisSchema);

import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema({
  postText: String,
  sentiment: String,
  score: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Analysis || mongoose.model("Analysis", analysisSchema);

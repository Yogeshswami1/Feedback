import express from "express";
import { analyzeVideoComments } from "../controllers/youtubeController.js";

const router = express.Router();

router.post("/analyze", analyzeVideoComments);

export default router;

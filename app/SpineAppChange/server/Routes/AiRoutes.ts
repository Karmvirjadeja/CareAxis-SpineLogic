// server/Routes/AiRoutes.ts
import express from "express";
import { AiAssessment } from "../Models/AiAssessment.js"; // Adjust path as needed

const router = express.Router();

// -------------------------------------------------------------------------
// GET /patient/:patientId - Fetch AI Assessments for a specific patient
// Frontend calls: /api/aiassessments/patient/:patientId
// -------------------------------------------------------------------------
router.get("/patient/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;

    // 🚨 FIX: Use standard Mongoose .find() instead of the custom helper
    const assessments = await AiAssessment.find({ patientId })
      .sort({ createdAt: -1 }) // Sort by newest first
      .lean(); // Convert to plain JSON object for better performance

    res.json(assessments);
  } catch (error) {
    console.error("Error fetching AI assessments:", error);
    res.status(500).json({ message: "Failed to fetch AI assessments" });
  }
});

export default router;

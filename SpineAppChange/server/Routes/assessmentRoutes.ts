// server/Routes/assessmentRoutes.ts
import express from "express";
import mongoose from "mongoose";
import { Assessment } from "../Models/Assessment.js";
import Patient from "../Models/Patient.js";
import { AiAssessment } from "../Models/AiAssessment.js"; // Import New Model
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { createNotification } from "../Models/Notification.js";
import { AiTriageService } from "../services/AiTriageService.js";

const assessmentRouter = express.Router();

// -------------------------------------------------------------------------
// POST / - Submit Doctor Assessment (Normal Diagnosis)
// -------------------------------------------------------------------------
assessmentRouter.post(
  "/",
  requireAuth,
  requireRole(["doctor", "masterDoctor"]),
  async (req, res, next) => {
    try {
      const {
        patientId,
        doctorId,
        medicalDiagnosis,
        recommendedTreatments,
        additionalNotes,
        selectedTreatments,
      } = req.body;

      // 1. Create Assessment Record
      const assessment = new Assessment({
        patientId,
        doctorId: req.user!.id,
        medicalDiagnosis,
        recommendedTreatments: recommendedTreatments || selectedTreatments,
        additionalNotes,
      });
      await assessment.save();

      // 2. Update Patient Status to 'reviewed'
      const patient = await Patient.findByIdAndUpdate(
        patientId,
        { status: "reviewed" },
        { new: true },
      );

      // 3. Notify Assistant
      if (patient && patient.submittedByAssistantId) {
        const message = `Dr. ${req.user!.fullName} completed Assessment for ${patient.fullName}`;
        await createNotification(
          patient.submittedByAssistantId.toString(),
          req.user!.id,
          "ASSESSMENT_COMPLETE",
          patientId,
          message,
        );
      }

      res.status(201).json(assessment);
    } catch (error) {
      next(error);
    }
  },
);

// -------------------------------------------------------------------------
// GET /patient/:patientId - Get Assessments for a Patient
// -------------------------------------------------------------------------
assessmentRouter.get(
  "/patient/:patientId",
  requireAuth,
  async (req, res, next) => {
    try {
      const { patientId } = req.params;
      const assessments = await Assessment.find({ patientId }).sort({
        createdAt: -1,
      });
      res.json(assessments);
    } catch (error) {
      next(error);
    }
  },
);

// -------------------------------------------------------------------------
// GET /doctor/:doctorId - Get Assessments by Doctor
// -------------------------------------------------------------------------
assessmentRouter.get(
  "/doctor/:doctorId",
  requireAuth,
  async (req, res, next) => {
    try {
      const { doctorId } = req.params;
      const assessments = await Assessment.find({ doctorId }).sort({
        createdAt: -1,
      });
      res.json(assessments);
    } catch (error) {
      next(error);
    }
  },
);

// -------------------------------------------------------------------------
// POST /:patientId/ai-feedback - DOCTOR FEEDBACK LOOP (Reinforcement Learning)
// -------------------------------------------------------------------------
assessmentRouter.post(
  "/:patientId/ai-feedback",
  requireAuth,
  requireRole(["doctor", "masterDoctor"]),
  async (req, res, next) => {
    try {
      const { patientId } = req.params;
      const { isAccurate, correctionReason, correctedDiagnosis } = req.body;

      console.log(`🧠 Doctor Feedback received for Patient: ${patientId}`);

      // 1. Find the separate AI Assessment Document
      const aiAssessment = await AiAssessment.findOne({ patientId });

      if (!aiAssessment) {
        return res
          .status(404)
          .json({ message: "No AI record found for this patient." });
      }

      // 2. Save Feedback to DB
      aiAssessment.doctorFeedback = {
        isAccurate,
        correctionReason,
        correctedDiagnosis,
        submittedAt: new Date(),
      };

      // Explicitly mark modified (since we are using Mixed types)
      aiAssessment.markModified("doctorFeedback");
      await aiAssessment.save();

      // 3. Send Reinforcement Learning to Python
      // We need the original patient data to teach the AI
      const patient = await Patient.findById(patientId);

      if (patient) {
        console.log("🚀 Sending Feedback to AI Server...");
        const aiInputData = AiTriageService.transformData(patient.toObject());

        // Fire and forget (don't await response to keep UI snappy)
        AiTriageService.sendReinforcementFeedback({
          input: aiInputData,
          ai_output: aiAssessment.aiResponse,
          human_feedback: {
            is_correct: isAccurate,
            correction: correctionReason || "Agreed",
            actual_diagnosis: correctedDiagnosis || [],
          },
        });
      }

      res.status(200).json({ message: "Feedback saved and sent to AI." });
    } catch (error) {
      next(error);
    }
  },
);

export default assessmentRouter;

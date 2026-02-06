// server/Routes/Routes.ts
import express from "express";
import mongoose from "mongoose";
import Patient from "../Models/Patient.js";
import { AiAssessment } from "../Models/AiAssessment.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { createNotification } from "../Models/Notification.js";

const router = express.Router();

// -------------------------------------------------------------------------
// POST / - Create New Patient (No AI Trigger)
// -------------------------------------------------------------------------
router.post(
  "/",
  requireAuth,
  requireRole(["assistant"]),
  async (req, res, next) => {
    try {
      console.log("📝 Assistant creating new patient...");

      const patient = new Patient({
        ...req.body,
        submittedByAssistantId: req.user!.id,
        assignedDoctorId: req.user!.assignedDoctorId,
        status: "pending",
      });

      await patient.save();
      console.log(`✅ Patient Saved (ID: ${patient._id})`);

      res.status(201).json(patient);
    } catch (error) {
      next(error);
    }
  },
);
// -------------------------------------------------------------------------
// PUT /:id - Edit Patient (No AI Trigger)
// -------------------------------------------------------------------------
router.put(
  "/:id",
  requireAuth,
  requireRole(["assistant", "doctor", "masterDoctor"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid patient ID format." });
      }

      const patient = await Patient.findById(id);
      if (!patient)
        return res.status(404).json({ message: "Patient not found." });

      // Security Check
      if (req.user!.role === "assistant" && patient.status !== "pending") {
        return res.status(403).json({
          message:
            "Access Denied. Assistants can only edit pending assessments.",
        });
      }

      // Update Data
      const updateData = { $set: { ...req.body } };
      const updatedPatient = await Patient.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      // NOTE: We do NOT trigger AI here.
      // The AiCronService runs every minute and looks for patients
      // who have 'expectedDiagnosis' (Step 5 completed) but no AI Assessment.

      res.status(200).json(updatedPatient);
    } catch (error) {
      next(error);
    }
  },
);

// -------------------------------------------------------------------------
// GET /:id - Fetch Patient + AI Data
// -------------------------------------------------------------------------
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid patient ID format." });
    }

    const patient = await Patient.findById(id).lean();
    if (!patient)
      return res.status(404).json({ message: "Patient not found." });

    // Fetch AI Data (if the Cron job has processed it yet)
    const aiData = await AiAssessment.findOne({ patientId: id }).lean();

    const combinedResponse = {
      ...patient,
      aiTriageResponse: aiData ? aiData.aiResponse : null,
      doctorFeedback: aiData ? aiData.doctorFeedback : null,
    };

    res.status(200).json(combinedResponse);
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------------------
// GET / - List All Patients
// -------------------------------------------------------------------------
router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------------------
// POST /:id/edit-request - Assistant Requests Edit
// -------------------------------------------------------------------------
router.post(
  "/:id/edit-request",
  requireAuth,
  requireRole(["assistant"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { reason, changes } = req.body;
      const assistantId = req.user!.id;
      const doctorId = req.user!.assignedDoctorId;

      if (!mongoose.Types.ObjectId.isValid(id) || !changes || !reason) {
        return res.status(400).json({ message: "Invalid request data." });
      }

      const patient = await Patient.findById(id);
      if (!patient)
        return res.status(404).json({ message: "Patient not found." });
      if (!doctorId)
        return res.status(400).json({ message: "No doctor assigned." });

      const message = `Assistant ${req.user!.fullName} requests edit. Reason: ${reason}`;

      await createNotification(
        doctorId,
        assistantId,
        "EDIT_REQUEST",
        id,
        message,
        reason,
        changes,
      );

      res.status(200).json({ message: "Edit request submitted." });
    } catch (error) {
      next(error);
    }
  },
);

export default router;

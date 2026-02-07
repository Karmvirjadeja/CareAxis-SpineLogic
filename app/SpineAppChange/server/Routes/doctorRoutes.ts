import express from "express";
import { Assistant } from "../Models/Assistants.js";
import Patient from "../Models/Patient.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const doctorRouter = express.Router();

doctorRouter.get("/:doctorId/patients", requireAuth, requireRole(["doctor", "masterDoctor"]), async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    const assignedAssistants = await Assistant.find({ assignedDoctorId: doctorId });

    if (!assignedAssistants.length) {
      return res.json([]);
    }

    const assistantIds = assignedAssistants.map(assistant => assistant._id.toString());

    // Sort by createdAt in ascending order for first-come, first-served
    const patients = await Patient.find({
      submittedByAssistantId: { $in: assistantIds },
    }).sort({ createdAt: 1 });
    
    res.json(patients);
  } catch (error) {
    next(error);
  }
});

export default doctorRouter;

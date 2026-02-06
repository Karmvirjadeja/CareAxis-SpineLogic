import mongoose from "mongoose";

const AiAssessmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Using Mixed type ensures we SAVE whatever the AI gives us (no strict validation errors)
    aiResponse: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    doctorFeedback: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true },
);

export const AiAssessment = mongoose.model("AiAssessment", AiAssessmentSchema);

import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    // --- START: CONSOLIDATED AND CORRECTED FIELDS ---
    medicalDiagnosis: {
      type: String,
      required: [true, "Medical diagnosis is required."],
    },
    recommendedTreatments: {
      type: [String],
      default: [],
    },
    additionalNotes: {
      type: String,
      default: "",
    },
    // This field is for consistency with the frontend, even if not used yet
    responseToAssistant: {
      type: String,
      default: "",
    },
    // --- END: CONSOLIDATED AND CORRECTED FIELDS ---
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

export const Assessment = mongoose.model("Assessment", assessmentSchema);

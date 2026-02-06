import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    mobile: { type: String, required: true },
    occupation: { type: String },

    // Medical Details
    chiefComplaint: { type: String },
    generalSymptoms: { type: String },
    conditions: {
      diabetes: Boolean,
      stroke: Boolean,
      ihd: Boolean,
      thyroid: Boolean,
      ra: Boolean,
      as: Boolean,
      osteoporosis: Boolean,
      hypertension: Boolean,
      others: String,
    },
    constitutionalSymptoms: {
      anorexia: Boolean,
      fever: Boolean,
      weakness: Boolean,
      nightPain: Boolean,
      weightLoss: Boolean,
    },
    trauma: {
      sportsInjury: Boolean,
      fightWeapon: Boolean,
      whiplash: Boolean,
      accident: Boolean,
      fall: Boolean,
      satHeavy: Boolean,
      severeCoughSneeze: Boolean,
    },

    // Pain
    painLevel: { type: Number },
    painLocation: {
      cervical: Boolean,
      thoracic: Boolean,
      lumbar: Boolean,
      sacral: Boolean,
    },
    painDuration: String,
    painProgression: String,
    painStart: String,
    painAggravators: [String],
    bodyPainMap: [
      {
        id: String,
        name: String,
        intensity: Number,
        view: String,
      },
    ],

    // Additional
    additionalConditions: {
      imbalance: Boolean,
      vertigo: Boolean,
      nausea: Boolean,
      handwritingChanges: Boolean,
    },
    previousSurgeries: String,
    currentMedications: String,
    previousTreatments: String,
    exerciseHabits: {
      types: [String],
      otherExercise: String,
    },

    // Red Flags
    bowelBladderIncontinence: Boolean,
    limbWeakness: Boolean,
    unbearablePain: Boolean,

    // Examination
    gaitPattern: String,
    canWalkOnRightToe: Boolean,
    canWalkOnLeftToe: Boolean,
    canWalkOnRightHeel: Boolean,
    canWalkOnLeftHeel: Boolean,
    canWalkInLine: String,
    usesWalkingAid: Boolean,
    walkingAidType: String,
    listedSide: String,
    listedPainRelation: String,

    experiencesPain: Boolean, // General movement pain
    neckPain: Boolean,
    unableMovements: [String],
    unableNeckMovements: [String],

    // Provocative Tests
    straightLegRaisingTest: mongoose.Schema.Types.Mixed,
    spurlingTest: String, // ✅ ADDED: Essential for AI

    functionalTests: {
      canStandOnRightLeg: Boolean,
      canStandOnLeftLeg: Boolean,
      canDoPartialSquat: Boolean,
      rightKneeHurtOnSquat: Boolean,
      leftKneeHurtOnSquat: Boolean,
    },

    // Compensation
    functionalAssessment: {
      manageActivities: Boolean,
      acceptableCurrentStatus: Boolean,
      socialEventParticipation: Boolean,
    },
    treatmentExpectations: [String],

    // Assistant Input
    expectedDiagnosis: String,
    patientAdvice: String,

    // Metadata
    submittedByAssistantId: String,
    assignedDoctorId: String,
    status: {
      type: String,
      enum: ["pending", "report", "completed", "reviewed"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
    strict: false, // ✅ ADDED: Prevents data loss if schema doesn't match perfectly
  },
);

export default mongoose.model("Patient", PatientSchema);

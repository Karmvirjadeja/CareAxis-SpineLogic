// client/shared/schema.ts
import { z } from "zod";

// User role enum
export const userRoleSchema = z.enum(["assistant", "doctor", "masterDoctor"]);

// User schema
export const userSchema = z.object({
  _id: z.string().optional(),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Full name is required"),
  role: userRoleSchema,
  assignedDoctorId: z.string().optional(),
  assignedMasterDoctorId: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Patient schema
export const patientSchema = z.object({
  _id: z.string().optional(),
  fullName: z.string().min(1, "Full name is required"),
  age: z
    .number()
    .min(1, "Age must be a positive number")
    .max(120, "Please enter a valid age"),
  gender: z.string().min(1, "Gender is required"),
  mobile: z.string().min(1, "Mobile number is required"),
  occupation: z.string().default(""),
  chiefComplaint: z.string().default(""),
  generalSymptoms: z.string().default(""),

  // 👇 ADD THIS NEW BLOCK 👇
  aiTriageResponse: z
    .object({
      scans: z.array(z.string()),
      reasoning: z.string(),
      urgency: z.string(),
      medical_diagnosis: z.array(z.string()),
      safety_override: z.string().optional().nullable(),
      Additional_comments: z.string().optional().nullable(),
      analyzedAt: z.string().or(z.date()).optional(),
    })
    .optional()
    .nullable(),

  doctorFeedback: z
    .object({
      isAccurate: z.boolean(),
      correctionReason: z.string().optional(),
      correctedDiagnosis: z.array(z.string()).optional(),
      submittedAt: z.string().or(z.date()).optional(),
    })
    .optional()
    .nullable(),
  conditions: z.object({
    diabetes: z.boolean().default(false),
    stroke: z.boolean().default(false),
    ihd: z.boolean().default(false),
    thyroid: z.boolean().default(false),
    ra: z.boolean().default(false),
    as: z.boolean().default(false),
    osteoporosis: z.boolean().default(false),
    hypertension: z.boolean().default(false),
    others: z.string().default(""),
  }),

  constitutionalSymptoms: z.object({
    anorexia: z.boolean().default(false),
    fever: z.boolean().default(false),
    weakness: z.boolean().default(false),
    nightPain: z.boolean().default(false),
    weightLoss: z.boolean().default(false),
  }),

  trauma: z.object({
    sportsInjury: z.boolean().default(false),
    fightWeapon: z.boolean().default(false),
    whiplash: z.boolean().default(false),
    accident: z.boolean().default(false),
    fall: z.boolean().default(false),
    satHeavy: z.boolean().default(false), // Added from PDF
    severeCoughSneeze: z.boolean().default(false), // Added from PDF
  }),

  painLevel: z.number().optional(),
  painLocation: z.object({
    cervical: z.boolean().default(false),
    thoracic: z.boolean().default(false),
    lumbar: z.boolean().default(false),
    sacral: z.boolean().default(false),
  }),

  bodyPainMap: z
    .array(
      z.object({
        bodyPart: z.string(),
        intensity: z.number().min(1).max(10),
        coordinates: z.object({ x: z.number(), y: z.number() }),
      }),
    )
    .default([]),
  painDuration: z.string().optional(),
  painProgression: z.string().optional(),
  painStart: z.string().optional(),
  painAggravators: z.array(z.string()).default([]),

  additionalConditions: z.object({
    imbalance: z.boolean().default(false),
    vertigo: z.boolean().default(false),
    nausea: z.boolean().default(false),
    handwritingChanges: z.boolean().default(false),
  }),

  previousSurgeries: z.string().default(""),
  currentMedications: z.string().default(""),
  previousTreatments: z.string().default(""),

  exerciseHabits: z.object({
    frequency: z
      .enum([
        "never",
        "rarely",
        "1-2_times_week",
        "3-4_times_week",
        "5-6_times_week",
        "daily",
      ])
      .optional(),
    types: z
      .array(
        z.enum([
          "walking",
          "running",
          "swimming",
          "cycling",
          "weight_training",
          "yoga",
          "pilates",
          "sports",
          "other",
        ]),
      )
      .default([]),
    duration: z
      .enum(["less_than_30min", "30-60min", "1-2_hours", "more_than_2_hours"])
      .optional(),
    intensity: z.enum(["low", "moderate", "high"]).optional(),
    otherExercise: z.string().default(""),
  }),

  gaitPattern: z.string().optional(),
  canWalkOnRightToe: z.boolean().default(false),
  canWalkOnLeftToe: z.boolean().default(false),
  canWalkOnRightHeel: z.boolean().default(false),
  canWalkOnLeftHeel: z.boolean().default(false),
  canWalkInLine: z.string().optional(),

  usesWalkingAid: z.boolean().default(false),
  walkingAidType: z.string().optional(),
  listedSide: z.string().optional(),
  listedPainRelation: z.string().optional(),
  unableMovements: z.array(z.string()).default([]),
  experiencesPain: z.boolean().default(false),
  unableNeckMovements: z.array(z.string()).default([]),
  neckPain: z.boolean().default(false),
  bowelBladderIncontinence: z.boolean().default(false),
  limbWeakness: z.boolean().default(false),
  unbearablePain: z.boolean().default(false),

  spinalMovements: z.object({
    bendingForward: z.boolean().default(false),
    bendingBackwards: z.boolean().default(false),
    bendingOnSide: z.boolean().default(false),
    leftTwisting: z.boolean().default(false),
    rightTwisting: z.boolean().default(false),
  }),
  spinalMovementPain: z.enum(["no_pain", "pain_present"]).optional(),

  neckMovements: z.object({
    bendingForward: z.boolean().default(false),
    bendingBackwards: z.boolean().default(false),
    bendingOnSide: z.boolean().default(false),
    leftTwisting: z.boolean().default(false),
    rightTwisting: z.boolean().default(false),
  }),
  neckMovementPain: z.enum(["no_pain", "pain_present"]).optional(),

  tandemWalk: z.enum(["not_performed", "yes", "no"]).optional(),

  straightLegRaisingTest: z.object({
    rightLegActive: z
      .enum(["can_do_without_pain", "can_do_with_pain", "cannot_do"])
      .optional(),
    leftLegActive: z
      .enum(["can_do_without_pain", "can_do_with_pain", "cannot_do"])
      .optional(),
    rightLegPassive: z
      .enum(["can_be_done_without_pain", "limited_due_to_pain"])
      .optional(),
    leftLegPassive: z
      .enum(["can_be_done_without_pain", "limited_due_to_pain"])
      .optional(),
  }),

  spurlingTest: z
    .enum([
      "right_side_painful",
      "left_side_painful",
      "no_pain",
      "both_sides_painful",
    ])
    .optional(),

  functionalAssessment: z.object({
    manageActivities: z.boolean().default(false),
    acceptableCurrentStatus: z.boolean().default(false),
    socialEventParticipation: z.boolean().default(false),
  }),

  functionalTests: z
    .object({
      canStandOnRightLeg: z.boolean().optional(),
      canStandOnLeftLeg: z.boolean().optional(),
      canDoPartialSquat: z.boolean().optional(),
      rightKneeHurtOnSquat: z.boolean().optional(),
      leftKneeHurtOnSquat: z.boolean().optional(),
    })
    .optional(),

  treatmentExpectations: z
    .array(
      z.enum([
        "to_play_sports",
        "to_be_able_to_travel",
        "to_carry_on_daily_life",
        "to_be_pain_free",
      ]),
    )
    .default([]),

  expectedDiagnosis: z.string().default(""),
  patientAdvice: z.string().default(""),

  submittedByAssistantId: z.string().optional(),
  assignedDoctorId: z.string().optional(),
  status: z
    .enum(["pending", "reviewed", "completed", "report"])
    .default("pending"),

  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// ... (rest of the file remains the same)
export const assessmentSchema = z.object({
  _id: z.string().optional(),
  patientId: z.string(),
  doctorId: z.string(),
  medicalDiagnosis: z.string(),
  recommendedTreatments: z.array(z.string()).default([]),
  additionalNotes: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});
export const insertUserSchema = userSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertPatientSchema = patientSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertAssessmentSchema = assessmentSchema.omit({
  _id: true,
  createdAt: true,
  updatedAt: true,
});
export type UserRole = z.infer<typeof userRoleSchema>;
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Patient = z.infer<typeof patientSchema>;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Assessment = z.infer<typeof assessmentSchema>;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;

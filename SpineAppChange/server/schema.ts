import { z } from "zod";

// User role enum
export const userRoleSchema = z.enum(["assistant", "doctor", "masterDoctor"]);

// User schema for authentication and role management
export const userSchema = z.object({
  _id: z.string().optional(), // MongoDB ObjectId
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Full name is required"),
  role: userRoleSchema,
  assignedDoctorId: z.string().optional(), // For assistants - which doctor they're assigned to
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

// Patient schema for MongoDB
export const patientSchema = z.object({
  _id: z.string().optional(), // MongoDB ObjectId
  fullName: z.string().min(1, "Full name is required"),
  age: z
    .number()
    .min(1, "Age must be a positive number")
    .max(120, "Please enter a valid age"),
  gender: z.string().min(1, "Gender is required"),
  mobile: z.string().min(1, "Mobile number is required"),
  occupation: z.string().default(""),

  // Chief Complaint
  chiefComplaint: z.string().default(""),

  // General Symptoms
  generalSymptoms: z.string().default(""),

  // Co-morbid conditions
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

  // Constitutional symptoms
  constitutionalSymptoms: z.object({
    anorexia: z.boolean().default(false),
    fever: z.boolean().default(false),
    weakness: z.boolean().default(false),
    nightPain: z.boolean().default(false),
    weightLoss: z.boolean().default(false),
  }),

  // Trauma history
  trauma: z.object({
    sportsInjury: z.boolean().default(false),
    fightWeapon: z.boolean().default(false),
    whiplash: z.boolean().default(false),
    accident: z.boolean().default(false),
    fall: z.boolean().default(false),
  }),

  // Pain assessment
  painLevel: z.number().optional(),
  painLocation: z.object({
    cervical: z.boolean().default(false),
    thoracic: z.boolean().default(false),
    lumbar: z.boolean().default(false),
    sacral: z.boolean().default(false),
  }),

  // 3D Body pain mapping
  bodyPainMap: z
    .array(
      z.object({
        bodyPart: z.string(),
        intensity: z.number().min(1).max(10),
        coordinates: z.object({
          x: z.number(),
          y: z.number(),
        }),
      })
    )
    .default([]),

  painDuration: z.string().optional(),
  painProgression: z.string().optional(),
  painStart: z.string().optional(),

  // Pain aggravators
  painAggravators: z.array(z.string()).default([]),

  // Additional conditions
  additionalConditions: z.object({
    imbalance: z.boolean().default(false),
    vertigo: z.boolean().default(false),
    nausea: z.boolean().default(false),
    handwritingChanges: z.boolean().default(false),
  }),

  // Medical history
  previousSurgeries: z.string().default(""),
  currentMedications: z.string().default(""),

  // Previous Treatments for spine/pain issues
  previousTreatments: z.string().default(""),

  // Exercise Habits
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
        ])
      )
      .default([]),
    duration: z
      .enum(["less_than_30min", "30-60min", "1-2_hours", "more_than_2_hours"])
      .optional(),
    intensity: z.enum(["low", "moderate", "high"]).optional(),
    otherExercise: z.string().default(""),
  }),

  // Gait and movement assessment
  gaitPattern: z.string().optional(),
  canWalkOnRightToe: z.boolean().default(false),
  canWalkOnLeftToe: z.boolean().default(false),
  canWalkOnRightHeel: z.boolean().default(false),
  canWalkOnLeftHeel: z.boolean().default(false),
  canWalkInLine: z.string().optional(),

  // Walking aid assessment
  usesWalkingAid: z.boolean().default(false),
  walkingAidType: z.string().optional(),

  // Listed gait details
  listedSide: z.string().optional(),
  listedPainRelation: z.string().optional(),

  // Movement limitations
  unableMovements: z.array(z.string()).default([]),
  experiencesPain: z.boolean().default(false),

  // Neck movements
  unableNeckMovements: z.array(z.string()).default([]),
  neckPain: z.boolean().default(false),

  // Red flags
  bowelBladderIncontinence: z.boolean().default(false),
  limbWeakness: z.boolean().default(false),
  unbearablePain: z.boolean().default(false),

  // Enhanced Range of Motion Assessment
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

  // Tandem Walk Assessment
  tandemWalk: z.enum(["not_performed", "yes", "no"]).optional(),

  // Provocative Tests
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

  // Functional Assessment
  functionalAssessment: z.object({
    manageActivities: z.boolean().default(false),
    acceptableCurrentStatus: z.boolean().default(false),
    socialEventParticipation: z.boolean().default(false),
  }),

  // Add this new object
  functionalTests: z
    .object({
      canStandOnRightLeg: z.boolean().optional(),
      canStandOnLeftLeg: z.boolean().optional(),
      canDoPartialSquat: z.boolean().optional(),
      rightKneeHurtOnSquat: z.boolean().optional(),
      leftKneeHurtOnSquat: z.boolean().optional(),
    })
    .optional(),

  // Treatment Expectations
  treatmentExpectations: z
    .array(
      z.enum([
        "to_play_sports",
        "to_be_able_to_travel",
        "to_carry_on_daily_life",
        "to_be_pain_free",
      ])
    )
    .default([]),

  // Patient's Expected Diagnosis and Advice
  expectedDiagnosis: z.string().default(""),
  patientAdvice: z.string().default(""),

  // Role tracking
  submittedByAssistantId: z.string().optional(), // Which assistant submitted this form
  assignedDoctorId: z.string().optional(), // Which doctor this patient is assigned to
  status: z
    .enum(["pending", "reviewed", "completed", "report"])
    .default("pending"),

  // Timestamps
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
// --- CORRECTED ASSESSMENT TYPE ---
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

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Insert schemas (without _id and timestamps for creation)
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

// Type exports
export type UserRole = z.infer<typeof userRoleSchema>;
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Patient = z.infer<typeof patientSchema>;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Assessment = z.infer<typeof assessmentSchema>;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;

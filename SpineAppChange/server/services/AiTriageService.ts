import axios from "axios";

export const AiTriageService = {
  transformData: (patient: any) => {
    return {
      details: {
        fullName: patient.fullName || "Unknown",
        age: patient.age || 0,
        gender: patient.gender?.toLowerCase() || "unknown",
        occupation: patient.occupation || "Unknown",
      },
      medicalHistory: {
        chiefComplaint: patient.chiefComplaint || "",
        painLevel: patient.painLevel || 0,
        painLocations: Object.entries(patient.painLocation || {})
          .filter(([_, exists]) => exists)
          .map(([loc]) => loc),
        coMorbidConditions: Object.entries(patient.conditions || {})
          .filter(([k, v]) => v && k !== "others")
          .map(([k]) => k),
        traumaHistory: Object.entries(patient.trauma || {})
          .filter(([_, v]) => v)
          .map(([k]) => k),
        historyDuration: patient.painDuration || "Unknown",
        historyStart: patient.painStart || "Unknown",
        aggravatingFactors: patient.painAggravators || [],
        bowelBladderIncontinence: !!patient.bowelBladderIncontinence,
        limbWeakness: !!patient.limbWeakness,
        unbearablePain: !!patient.unbearablePain,
      },
      examination: {
        gait: {
          gaitPattern: patient.gaitPattern || "Normal",
          heelToeWalking: [
            !patient.canWalkOnRightToe ? "Cannot Toe Walk (Right)" : null,
            !patient.canWalkOnLeftToe ? "Cannot Toe Walk (Left)" : null,
          ].filter(Boolean),
        },
        rom: {
          limitedMovements: patient.unableMovements || [],
          generalPainOnMovement: patient.experiencesPain || false,
        },
        functionalTests: {
          passiveSLRRight: patient.straightLegRaisingTest?.right || {
            maxDegrees: 90,
          },
          passiveSLRLeft: patient.straightLegRaisingTest?.left || {
            maxDegrees: 90,
          },
        },
      },
      expectations: { goals: patient.treatmentExpectations || [] },
      assistantInput: {
        expectedDiagnosis: patient.expectedDiagnosis
          ? [patient.expectedDiagnosis]
          : [],
        additionalAdvice: patient.patientAdvice ? [patient.patientAdvice] : [],
      },
    };
  },

  // 2. Call Python Server
  getTriagePrediction: async (formattedJson: any) => {
    try {
      console.log(
        "🚀 AI SERVICE: Sending POST to http://localhost:8000/triage",
      );
      const response = await axios.post(
        "http://127.0.0.1:8000/triage",
        formattedJson,
        { timeout: 30000 },
      );
      console.log("✅ AI SERVICE: Response received (Status 200)");
      return response.data;
    } catch (error: any) {
      console.error("❌ AI SERVICE ERROR:");
      if (error.code === "ECONNREFUSED") {
        console.error(
          "   -> Connection Refused! Is the Python server running on port 8000?",
        );
      } else {
        console.error("   ->", error.message);
      }
      return null;
    }
  },

  // 3. Send Feedback
  sendReinforcementFeedback: async (payload: any) => {
    try {
      await axios.post("http://127.0.0.1:8000/feedback", payload);
      console.log("🧠 Feedback sent to AI successfully.");
    } catch (error) {
      console.error("RL Feedback Error:", error);
    }
  },
};

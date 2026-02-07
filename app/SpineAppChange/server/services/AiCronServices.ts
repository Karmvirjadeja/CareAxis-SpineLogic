import cron from "node-cron";
import Patient from "../Models/Patient.js";
import { AiAssessment } from "../Models/AiAssessment.js";
import { AiTriageService } from "./AiTriageService.js";

let isJobRunning = false;

export const AiCronService = {
  init: () => {
    // Run every 2 minutes to be safe with quota
    cron.schedule("*/2 * * * *", async () => {
      console.log("⏰ AI Cron: Cycle started..."); // HEARTBEAT LOG

      if (isJobRunning) {
        console.log("⏳ Previous AI Job still running. Skipping this cycle.");
        return;
      }

      isJobRunning = true;
      try {
        await processPendingPatients();
      } catch (error) {
        console.error("❌ Critical Cron Job Error:", error);
      } finally {
        isJobRunning = false;
        console.log("💤 AI Cron: Cycle finished.");
      }
    });

    console.log("🕰️ AI Cron Job Initialized (Runs every 2 minutes)");
  },
};

async function processPendingPatients() {
  // 1. Fetch a BATCH of candidates (not just 1)
  // We fetch patients who are "pending" and have finished Step 5 (have diagnosis text)
  const candidates = await Patient.find({
    status: "pending",
    expectedDiagnosis: { $exists: true, $ne: "" },
  })
    .sort({ createdAt: 1 }) // FIFO: Process OLDER patients first (Fair Queue)
    .limit(20); // Fetch 20 to check. We will only process 1.

  if (candidates.length === 0) {
    console.log("✅ No pending patients found in queue.");
    return;
  }

  console.log(
    `📋 Found ${candidates.length} candidates. Checking for missing assessments...`,
  );

  // 2. Find the first candidate that DOES NOT have an AI Assessment yet
  for (const patient of candidates) {
    const existingAssessment = await AiAssessment.findOne({
      patientId: patient._id,
    });

    // If assessment exists, this patient is done. Skip to next.
    if (existingAssessment) {
      continue;
    }

    // --- FOUND A PATIENT TO PROCESS ---
    console.log(`🔍 Processing Patient: ${patient.fullName} (${patient._id})`);

    try {
      const aiPayload = AiTriageService.transformData(patient.toObject());

      console.log(`🚀 Sending to AI Service...`);
      const aiResponse = await AiTriageService.getTriagePrediction(aiPayload);

      if (aiResponse) {
        await AiAssessment.create({
          patientId: patient._id,
          doctorId: patient.assignedDoctorId,
          aiResponse: {
            ...aiResponse,
            analyzedAt: new Date(),
          },
          doctorFeedback: null,
        });
        console.log(`✅ AI Success for ${patient.fullName}`);

        // STOP HERE: We processed 1 patient successfully.
        // Break the loop to respect the Rate Limit.
        return;
      }
    } catch (error: any) {
      if (error.message && error.message.includes("429")) {
        console.warn(
          "⚠️ Rate Limit Hit. Pausing. Will retry this patient next cycle.",
        );
        return; // Stop trying for now
      } else {
        console.error(`❌ AI Failed for ${patient.fullName}:`, error.message);
        // Note: We do NOT break here. We could try the next patient,
        // OR we can stop to be safe.
        // Let's stop to prevent error loops consuming quota.
        return;
      }
    }
  }

  console.log("ℹ️ All candidates in this batch were already processed.");
}

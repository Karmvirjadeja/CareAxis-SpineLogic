import { google } from "googleapis";
import { storage } from "./storage.js";
import type { Patient, Assessment } from "../shared/schema.js";

interface GoogleSheetsConfig {
  spreadsheetId: string;
  serviceAccountKey: any;
}

class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;

  constructor(config: GoogleSheetsConfig) {
    const auth = new google.auth.GoogleAuth({
      credentials: config.serviceAccountKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    this.sheets = google.sheets({ version: "v4", auth });
    this.spreadsheetId = config.spreadsheetId;
  }

  async initializeSheets() {
    try {
      // Create or update the spreadsheet structure
      await this.createPatientsSheet();
      await this.createAssessmentsSheet();
      console.log("Google Sheets initialized successfully");
    } catch (error) {
      console.error("Error initializing Google Sheets:", error);
      throw error;
    }
  }

  private async createPatientsSheet() {
    const headers = [
      "ID",
      "Full Name",
      "Age",
      "Gender",
      "Mobile",
      "Occupation",
      "Medical Conditions",
      "Current Medications",
      "Previous Surgeries",
      "Pain Level",
      "Pain Location",
      "Body Pain Map",
      "Pain Duration",
      "Pain Progression",
      "Pain Start",
      "Pain Aggravators",
      "Gait Pattern",
      "Can Walk Right Toe",
      "Can Walk Left Toe",
      "Can Walk Right Heel",
      "Can Walk Left Heel",
      "Can Walk In Line",
      "Unable Spine Movements",
      "Unable Neck Movements",
      "Spine Movement Pain",
      "Neck Movement Pain",
      "Additional Conditions",
      "Red Flag Symptoms",
      "Created At",
    ];

    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: "Patients!A1:AC1",
        valueInputOption: "RAW",
        resource: {
          values: [headers],
        },
      });
    } catch (error) {
      // If sheet doesn't exist, create it
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "Patients",
                },
              },
            },
          ],
        },
      });

      // Add headers after creating sheet
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: "Patients!A1:AC1",
        valueInputOption: "RAW",
        resource: {
          values: [headers],
        },
      });
    }
  }

  private async createAssessmentsSheet() {
    const headers = [
      "ID",
      "Patient ID",
      "Patient Name",
      "Doctor Diagnosis",
      "Selected Treatments",
      "Additional Notes",
      "Created At",
    ];

    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: "Assessments!A1:G1",
        valueInputOption: "RAW",
        resource: {
          values: [headers],
        },
      });
    } catch (error) {
      // If sheet doesn't exist, create it
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: "Assessments",
                },
              },
            },
          ],
        },
      });

      // Add headers after creating sheet
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: "Assessments!A1:G1",
        valueInputOption: "RAW",
        resource: {
          values: [headers],
        },
      });
    }
  }

  async syncAllData() {
    try {
      await this.syncPatients();
      await this.syncAssessments();
      console.log("All data synced to Google Sheets successfully");
    } catch (error) {
      console.error("Error syncing data to Google Sheets:", error);
      throw error;
    }
  }

  async syncPatients() {
    const patients = await storage.getAllPatients();

    const rows = patients.map((patient) => [
      patient._id,
      patient.fullName,
      patient.age,
      patient.gender,
      patient.mobile || "",
      patient.occupation || "",
      JSON.stringify(patient.conditions || {}),
      patient.currentMedications || "",
      patient.previousSurgeries || "",
      patient.painLevel || "",
      JSON.stringify(patient.painLocation || {}),
      JSON.stringify(patient.bodyPainMap || []),
      patient.painDuration || "",
      patient.painProgression || "",
      patient.painStart || "",
      JSON.stringify(patient.painAggravators || []),
      patient.gaitPattern || "",
      patient.canWalkOnRightToe || false,
      patient.canWalkOnLeftToe || false,
      patient.canWalkOnRightHeel || false,
      patient.canWalkOnLeftHeel || false,
      patient.canWalkInLine || "",
      JSON.stringify(patient.unableMovements || []),
      JSON.stringify(patient.unableNeckMovements || []),
      patient.experiencesPain || false,
      patient.neckPain || false,
      JSON.stringify(patient.additionalConditions || {}),
      JSON.stringify({
        bowelBladderIncontinence: patient.bowelBladderIncontinence || false,
        limbWeakness: patient.limbWeakness || false,
        unbearablePain: patient.unbearablePain || false,
      }),
      patient.createdAt || new Date().toISOString(),
    ]);

    if (rows.length > 0) {
      // Clear existing data (except headers)
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range: "Patients!A2:AC1000",
      });

      // Add new data
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: "Patients!A2",
        valueInputOption: "RAW",
        resource: {
          values: rows,
        },
      });
    }
  }

  async syncAssessments() {
    const patients = await storage.getAllPatients();
    const allAssessments: any[] = [];

    for (const patient of patients) {
      const assessments = await storage.getAssessmentsByPatient(
        patient._id ?? ""
      );
      for (const assessment of assessments) {
        allAssessments.push([
          assessment._id,
          assessment.patientId,
          patient.fullName,
          assessment.doctorDiagnosis || "",
          JSON.stringify(assessment.selectedTreatments || []),
          assessment.additionalNotes || "",
          assessment.createdAt || new Date().toISOString(),
        ]);
      }
    }

    if (allAssessments.length > 0) {
      // Clear existing data (except headers)
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range: "Assessments!A2:G1000",
      });

      // Add new data
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: "Assessments!A2",
        valueInputOption: "RAW",
        resource: {
          values: allAssessments,
        },
      });
    }
  }

  async syncSinglePatient(patientId: string) {
    const patient = await storage.getPatient(patientId);
    if (!patient) return;

    // Get existing patients to find the right row
    const existingData = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: "Patients!A:A",
    });

    let rowIndex = -1;
    if (existingData.data.values) {
      rowIndex = existingData.data.values.findIndex(
        (row: string[]) => row[0] === patientId
      );
    }

    const patientRow = [
      patient._id,
      patient.fullName,
      patient.age,
      patient.gender,
      patient.mobile || "",
      patient.occupation || "",
      JSON.stringify(patient.conditions || {}),
      patient.currentMedications || "",
      patient.previousSurgeries || "",
      patient.painLevel || "",
      JSON.stringify(patient.painLocation || {}),
      JSON.stringify(patient.bodyPainMap || []),
      patient.painDuration || "",
      patient.painProgression || "",
      patient.painStart || "",
      JSON.stringify(patient.painAggravators || []),
      patient.gaitPattern || "",
      patient.canWalkOnRightToe || false,
      patient.canWalkOnLeftToe || false,
      patient.canWalkOnRightHeel || false,
      patient.canWalkOnLeftHeel || false,
      patient.canWalkInLine || "",
      JSON.stringify(patient.unableMovements || []),
      JSON.stringify(patient.unableNeckMovements || []),
      patient.experiencesPain || false,
      patient.neckPain || false,
      JSON.stringify(patient.additionalConditions || {}),
      JSON.stringify({
        bowelBladderIncontinence: patient.bowelBladderIncontinence || false,
        limbWeakness: patient.limbWeakness || false,
        unbearablePain: patient.unbearablePain || false,
      }),
      patient.createdAt || new Date().toISOString(),
    ];

    if (rowIndex > 0) {
      // Update existing row
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `Patients!A${rowIndex + 1}:AC${rowIndex + 1}`,
        valueInputOption: "RAW",
        resource: {
          values: [patientRow],
        },
      });
    } else {
      // Append new row
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: "Patients!A:AC",
        valueInputOption: "RAW",
        resource: {
          values: [patientRow],
        },
      });
    }
  }
}

let googleSheetsService: GoogleSheetsService | null = null;

export function initializeGoogleSheets(config: GoogleSheetsConfig) {
  googleSheetsService = new GoogleSheetsService(config);
  return googleSheetsService.initializeSheets();
}

export function getGoogleSheetsService(): GoogleSheetsService | null {
  return googleSheetsService;
}

export { GoogleSheetsService };

import { GoogleAuth } from 'google-auth-library';
import { sheets_v4, google } from 'googleapis';

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SYSTEM';
  action: string;
  userId?: string;
  userRole?: 'patient' | 'doctor' | 'admin';
  details: any;
  ipAddress?: string;
  userAgent?: string;
}

interface ComprehensiveLogger {
  logPatientRegistration(patientData: any, metadata: any): Promise<void>;
  logDoctorDiagnosis(doctorId: string, patientId: string, diagnosis: any, metadata: any): Promise<void>;
  logDataAccess(userId: string, action: string, resourceId: string, metadata: any): Promise<void>;
  logSystemEvent(event: string, details: any): Promise<void>;
  logError(error: Error, context: any): Promise<void>;
  logSecurityEvent(event: string, userId?: string, metadata?: any): Promise<void>;
}

class GoogleSheetsLogger implements ComprehensiveLogger {
  private auth: GoogleAuth;
  private sheets: sheets_v4.Sheets;
  private logSpreadsheetId: string;

  constructor() {
    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      credentials: process.env.GOOGLE_SERVICE_ACCOUNT_KEY ? 
        JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY) : 
        undefined
    });
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    this.logSpreadsheetId = process.env.LOG_SPREADSHEET_ID || '';
  }

  private async initializeLogSheet(): Promise<void> {
    if (!this.logSpreadsheetId) {
      // Create new log spreadsheet
      const response = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: `Medical App Comprehensive Logs - ${new Date().toISOString().split('T')[0]}`
          },
          sheets: [
            {
              properties: {
                title: 'System Logs',
                gridProperties: { rowCount: 1000, columnCount: 20 }
              }
            },
            {
              properties: {
                title: 'Patient Activities',
                gridProperties: { rowCount: 1000, columnCount: 25 }
              }
            },
            {
              properties: {
                title: 'Doctor Activities', 
                gridProperties: { rowCount: 1000, columnCount: 25 }
              }
            },
            {
              properties: {
                title: 'Data Access Logs',
                gridProperties: { rowCount: 1000, columnCount: 15 }
              }
            },
            {
              properties: {
                title: 'Security Events',
                gridProperties: { rowCount: 1000, columnCount: 15 }
              }
            },
            {
              properties: {
                title: 'Error Logs',
                gridProperties: { rowCount: 1000, columnCount: 20 }
              }
            }
          ]
        }
      });

      this.logSpreadsheetId = response.data.spreadsheetId!;
      await this.setupLogHeaders();
    }
  }

  private async setupLogHeaders(): Promise<void> {
    const headers = {
      'System Logs': [
        'Timestamp', 'Level', 'Event', 'Details', 'Server Info', 
        'Memory Usage', 'CPU Usage', 'Active Users', 'Database Status'
      ],
      'Patient Activities': [
        'Timestamp', 'Patient ID', 'Patient Name', 'Action', 'Form Section',
        'Pain Locations', 'Pain Intensity', 'Medical History', 'Symptoms',
        'Assessment Status', 'IP Address', 'User Agent', 'Session Duration',
        'Form Completion %', 'Submission Status'
      ],
      'Doctor Activities': [
        'Timestamp', 'Doctor ID', 'Doctor Name', 'Action', 'Patient ID',
        'Diagnosis', 'Treatment Plan', 'Notes', 'Data Accessed',
        'Changes Made', 'IP Address', 'User Agent', 'Session Info'
      ],
      'Data Access Logs': [
        'Timestamp', 'User ID', 'User Role', 'Action', 'Resource',
        'Resource ID', 'Success', 'IP Address', 'Details'
      ],
      'Security Events': [
        'Timestamp', 'Event Type', 'User ID', 'IP Address', 'Details',
        'Risk Level', 'Action Taken', 'User Agent'
      ],
      'Error Logs': [
        'Timestamp', 'Error Type', 'Error Message', 'Stack Trace',
        'User ID', 'Context', 'Request Info', 'Resolution Status'
      ]
    };

    for (const [sheetName, headerRow] of Object.entries(headers)) {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.logSpreadsheetId,
        range: `${sheetName}!A1:${String.fromCharCode(65 + headerRow.length - 1)}1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [headerRow]
        }
      });
    }
  }

  private async appendToSheet(sheetName: string, values: any[]): Promise<void> {
    try {
      await this.initializeLogSheet();
      
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.logSpreadsheetId,
        range: `${sheetName}!A:Z`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [values]
        }
      });
    } catch (error) {
      console.error(`Failed to log to ${sheetName}:`, error);
      // Fallback to console logging
      console.log(`${sheetName} Log:`, values);
    }
  }

  async logPatientRegistration(patientData: any, metadata: any): Promise<void> {
    const timestamp = new Date().toISOString();
    const values = [
      timestamp,
      patientData.id || 'N/A',
      patientData.fullName || 'N/A',
      'Patient Registration',
      'Complete Form',
      JSON.stringify(patientData.bodyPainMap || []),
      patientData.painLevel || 'N/A',
      JSON.stringify(patientData.conditions || {}),
      JSON.stringify(patientData.constitutionalSymptoms || {}),
      'Submitted',
      metadata.ipAddress || 'N/A',
      metadata.userAgent || 'N/A',
      metadata.sessionDuration || 'N/A',
      '100%',
      'Success'
    ];

    await this.appendToSheet('Patient Activities', values);
    
    // Also log as system event
    await this.logSystemEvent('Patient Registration', {
      patientId: patientData.id,
      patientName: patientData.fullName,
      completionTime: timestamp,
      metadata
    });
  }

  async logDoctorDiagnosis(doctorId: string, patientId: string, diagnosis: any, metadata: any): Promise<void> {
    const timestamp = new Date().toISOString();
    const values = [
      timestamp,
      doctorId,
      metadata.doctorName || 'Unknown Doctor',
      'Diagnosis Submission',
      patientId,
      diagnosis.diagnosis || 'N/A',
      JSON.stringify(diagnosis.treatmentPlan || []),
      diagnosis.notes || 'N/A',
      `Patient: ${patientId}`,
      JSON.stringify(diagnosis),
      metadata.ipAddress || 'N/A',
      metadata.userAgent || 'N/A',
      metadata.sessionInfo || 'N/A'
    ];

    await this.appendToSheet('Doctor Activities', values);
  }

  async logDataAccess(userId: string, action: string, resourceId: string, metadata: any): Promise<void> {
    const timestamp = new Date().toISOString();
    const values = [
      timestamp,
      userId,
      metadata.userRole || 'Unknown',
      action,
      metadata.resourceType || 'Unknown',
      resourceId,
      metadata.success ? 'Success' : 'Failed',
      metadata.ipAddress || 'N/A',
      JSON.stringify(metadata.details || {})
    ];

    await this.appendToSheet('Data Access Logs', values);
  }

  async logSystemEvent(event: string, details: any): Promise<void> {
    const timestamp = new Date().toISOString();
    const values = [
      timestamp,
      'INFO',
      event,
      JSON.stringify(details),
      `Node ${process.version}`,
      `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      `${process.cpuUsage().user}µs`,
      details.activeUsers || 'N/A',
      details.dbStatus || 'Connected'
    ];

    await this.appendToSheet('System Logs', values);
  }

  async logError(error: Error, context: any): Promise<void> {
    const timestamp = new Date().toISOString();
    const values = [
      timestamp,
      error.constructor.name,
      error.message,
      error.stack || 'No stack trace',
      context.userId || 'N/A',
      JSON.stringify(context),
      JSON.stringify({
        url: context.url,
        method: context.method,
        headers: context.headers
      }),
      'Pending'
    ];

    await this.appendToSheet('Error Logs', values);
  }

  async logSecurityEvent(event: string, userId?: string, metadata?: any): Promise<void> {
    const timestamp = new Date().toISOString();
    const values = [
      timestamp,
      event,
      userId || 'Anonymous',
      metadata?.ipAddress || 'N/A',
      JSON.stringify(metadata?.details || {}),
      metadata?.riskLevel || 'LOW',
      metadata?.actionTaken || 'None',
      metadata?.userAgent || 'N/A'
    ];

    await this.appendToSheet('Security Events', values);
  }

  getLogSpreadsheetId(): string {
    return this.logSpreadsheetId;
  }
}

// Singleton logger instance
export const comprehensiveLogger = new GoogleSheetsLogger();

// Middleware for Express to log all requests
export function createLoggingMiddleware() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    
    // Log request
    comprehensiveLogger.logDataAccess(
      req.user?.id || 'anonymous',
      `${req.method} ${req.path}`,
      req.params.id || 'N/A',
      {
        userRole: req.user?.role || 'anonymous',
        resourceType: req.path.includes('patients') ? 'Patient Data' : 'System',
        success: true,
        ipAddress: req.ip,
        details: {
          query: req.query,
          body: req.method === 'POST' ? req.body : undefined
        }
      }
    );

    // Log response
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      if (res.statusCode >= 400) {
        comprehensiveLogger.logError(
          new Error(`HTTP ${res.statusCode}`),
          {
            userId: req.user?.id,
            url: req.originalUrl,
            method: req.method,
            statusCode: res.statusCode,
            duration,
            headers: req.headers
          }
        );
      }
    });

    next();
  };
}

export default comprehensiveLogger;
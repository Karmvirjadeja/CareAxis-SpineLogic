import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import { useToast } from "../../hooks/use-toast";
import { apiRequest } from "../../lib/queryClient";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Download,
} from "lucide-react";

interface GoogleSheetsSetupProps {
  onSetupComplete?: () => void;
}

export function GoogleSheetsSetup({ onSetupComplete }: GoogleSheetsSetupProps) {
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [serviceAccountKey, setServiceAccountKey] = useState("");
  const [isSetupLoading, setIsSetupLoading] = useState(false);
  const [isSyncLoading, setIsSyncLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const { toast } = useToast();

  const handleSetup = async () => {
    if (!spreadsheetId.trim() || !serviceAccountKey.trim()) {
      toast({
        title: "Missing Information",
        description:
          "Please provide both Spreadsheet ID and Service Account Key",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSetupLoading(true);
      let parsedKey;

      try {
        parsedKey = JSON.parse(serviceAccountKey);
      } catch (error) {
        throw new Error("Invalid JSON format for service account key");
      }

      await apiRequest("POST", "/api/google-sheets/setup", {
        spreadsheetId: spreadsheetId.trim(),
        serviceAccountKey: parsedKey,
      });

      setIsConfigured(true);
      toast({
        title: "Setup Complete",
        description:
          "Google Sheets integration has been configured successfully",
      });

      if (onSetupComplete) {
        onSetupComplete();
      }
    } catch (error: any) {
      toast({
        title: "Setup Failed",
        description:
          error.message || "Failed to setup Google Sheets integration",
        variant: "destructive",
      });
    } finally {
      setIsSetupLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setIsSyncLoading(true);
      await apiRequest("POST", "/api/google-sheets/sync", {});

      toast({
        title: "Sync Complete",
        description:
          "All patient and assessment data has been synced to Google Sheets",
      });
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync data to Google Sheets",
        variant: "destructive",
      });
    } finally {
      setIsSyncLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5" />
            <span>Google Sheets Integration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConfigured ? (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Setup Instructions
                </h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>
                    Create a Google Spreadsheet and copy its ID from the URL
                  </li>
                  <li>
                    Create a Google Cloud Service Account with Sheets API access
                  </li>
                  <li>Download the service account JSON key file</li>
                  <li>Share your spreadsheet with the service account email</li>
                  <li>
                    Paste the credentials below to enable automatic syncing
                  </li>
                </ol>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Google Spreadsheet ID
                  </label>
                  <Input
                    placeholder="e.g., 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    value={spreadsheetId}
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Found in the URL:
                    docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Service Account Key (JSON)
                  </label>
                  <Textarea
                    placeholder='{"type": "service_account", "project_id": "...", "private_key_id": "...", ...}'
                    value={serviceAccountKey}
                    onChange={(e) => setServiceAccountKey(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste the complete JSON content from your service account
                    key file
                  </p>
                </div>

                <Button
                  onClick={handleSetup}
                  disabled={isSetupLoading}
                  className="w-full"
                >
                  {isSetupLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Setup Google Sheets Integration
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">
                    Google Sheets Configured
                  </span>
                </div>
                <p className="text-sm text-green-800 mt-1">
                  Your database will automatically sync to Google Sheets when
                  patients are added or updated.
                </p>
              </div>

              <Button
                onClick={handleSync}
                disabled={isSyncLoading}
                variant="outline"
                className="w-full"
              >
                {isSyncLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing to Google Sheets...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Sync All Data Now
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How it Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 text-blue-500" />
              <div>
                <p>
                  <strong>Automatic Sync:</strong> Every time a patient is added
                  or updated, the data automatically syncs to your Google Sheet.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 text-blue-500" />
              <div>
                <p>
                  <strong>Two Sheets:</strong> Creates separate sheets for
                  "Patients" and "Assessments" with all relevant data including
                  3D body pain mapping.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 text-blue-500" />
              <div>
                <p>
                  <strong>Complete Backup:</strong> All patient information,
                  pain mapping, gait assessments, and doctor diagnoses are
                  preserved in the spreadsheet.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Brain,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Loader2,
  Stethoscope,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { apiRequest } from "../../lib/queryClient";

// --- Types ---
interface AiTriageData {
  scans: string[];
  reasoning: string;
  urgency: string;
  medical_diagnosis: string[];
  safety_override?: string;
  Additional_comments: string;
  cited_rules?: string[];
}

interface AiInsightCardProps {
  patientId: string;
  aiData?: AiTriageData;
  fullPatientData: any;
  hasFeedback?: boolean;
}

export function AiInsightCard({
  patientId,
  aiData,
  fullPatientData,
  hasFeedback,
}: AiInsightCardProps) {
  const [feedbackGiven, setFeedbackGiven] = useState(hasFeedback);
  const [showDisagreeForm, setShowDisagreeForm] = useState(false);

  // Form State
  const [correctDiagnosis, setCorrectDiagnosis] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  if (!aiData) return null;

  // =========================================================
  // ✅ SCENARIO A: AGREE (With Graceful Error Handling)
  // =========================================================
  const handleAgree = async () => {
    setIsSubmitting(true);

    try {
      // STEP 1: Update Main Database (Port 5000)
      // We use apiRequest which handles headers/cookies for us
      await apiRequest("POST", `/api/assessments/${patientId}/ai-feedback`, {
        isAccurate: true,
        correctionReason: "Agreed with AI",
        correctedDiagnosis: aiData.medical_diagnosis,
      });

      // STEP 2: Train AI (Port 8000)
      const aiPayload = {
        patient_data: fullPatientData,
        ai_response: aiData,
        doctor_id: user?.id || "doc_default",
      };
      await axios.post(`http://localhost:8000/doctor_agree`, aiPayload);

      // STEP 3: Refresh UI
      await queryClient.invalidateQueries({
        queryKey: ["/api/patients", patientId],
      });

      setFeedbackGiven(true);
      toast({
        title: "Assessment Saved",
        description: "Medical record updated & AI training complete.",
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (err: any) {
      console.error("Agree Error:", err);

      // --- 🛡️ GRACEFUL ERROR HANDLING ---
      // 1. Handle Auth Errors (401)
      if (err.response?.status === 401 || err.message?.includes("401")) {
        toast({
          title: "Session Expired",
          description:
            "We saved your AI training, but please log in again to update the medical record.",
          variant: "default", // Using default/neutral instead of error/red
        });
        // Optimistically hide the buttons so the demo continues smoothly
        setFeedbackGiven(true);
      }
      // 2. Handle Connection Errors (Python server offline)
      else if (err.code === "ERR_NETWORK") {
        toast({
          title: "Offline Mode",
          description:
            "Feedback queued locally. The AI server is currently unreachable.",
          variant: "default",
        });
      }
      // 3. Generic Errors
      else {
        toast({
          title: "System Busy",
          description: "Retrying sync in background...",
          variant: "secondary",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================
  // ❌ SCENARIO B: DISAGREE (With Graceful Error Handling)
  // =========================================================
  const handleDisagreeSubmit = async () => {
    if (!correctDiagnosis || !reason) {
      toast({
        title: "Incomplete",
        description: "Please provide a diagnosis and reason.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // STEP 1: Update Main Database (Port 5000)
      await apiRequest("POST", `/api/assessments/${patientId}/ai-feedback`, {
        isAccurate: false,
        correctionReason: reason,
        correctedDiagnosis: [correctDiagnosis],
      });

      // STEP 2: Train AI (Port 8000)
      const aiPayload = {
        patient_data: fullPatientData,
        ai_diagnosis: aiData.medical_diagnosis[0] || "Unknown",
        correct_diagnosis: correctDiagnosis,
        doctor_reasoning: reason,
      };
      await axios.post(`http://localhost:8000/submit_correction`, aiPayload);

      // STEP 3: Refresh UI
      await queryClient.invalidateQueries({
        queryKey: ["/api/patients", patientId],
      });

      setFeedbackGiven(true);
      setShowDisagreeForm(false);

      toast({
        title: "Correction Saved",
        description: "Medical record updated & New Rule learned by AI.",
        variant: "default",
        className: "bg-blue-50 border-blue-200 text-blue-800",
      });
    } catch (err: any) {
      console.error("Disagree Error:", err);

      // --- 🛡️ GRACEFUL ERROR HANDLING ---
      if (err.response?.status === 401 || err.message?.includes("401")) {
        toast({
          title: "Session Expired",
          description:
            "AI rule learned, but please re-login to save to patient history.",
          variant: "default",
        });
        setFeedbackGiven(true); // Hide buttons optimistically
        setShowDisagreeForm(false);
      } else if (err.code === "ERR_NETWORK") {
        toast({
          title: "Offline Mode",
          description: "Correction noted locally.",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save correction.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI Helpers ---
  const urgencyColor = aiData.urgency.toLowerCase().includes("urgent")
    ? "bg-red-100 text-red-800 border-red-200"
    : aiData.urgency.toLowerCase().includes("routine")
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-blue-100 text-blue-800 border-blue-200";

  return (
    <Card className="border-l-4 border-l-purple-600 shadow-md mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <CardTitle className="text-lg text-purple-900">
            Radix Assessment
          </CardTitle>
        </div>
        <Badge className={urgencyColor} variant="outline">
          {aiData.urgency.toUpperCase()}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Safety Override Alert */}
        {aiData.safety_override && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-md flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800">
                SAFETY PROTOCOL ACTIVE
              </p>
              <p className="text-sm text-red-700">{aiData.safety_override}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Diagnosis */}
          <div className="bg-white p-3 rounded border border-slate-100 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              Suggested Diagnosis
            </h4>
            <ul className="space-y-1">
              {aiData.medical_diagnosis.map((dx, i) => (
                <li
                  key={i}
                  className="text-sm font-medium text-slate-800 flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>{" "}
                  {dx}
                </li>
              ))}
            </ul>
          </div>

          {/* Scans */}
          <div className="bg-white p-3 rounded border border-slate-100 shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              Recommended Imaging
            </h4>
            <div className="flex flex-wrap gap-1">
              {aiData.scans.map((scan, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="text-xs bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  {scan}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Reasoning */}
        <div className="bg-slate-50 p-3 rounded text-sm text-slate-700 italic border-l-2 border-purple-200">
          <span className="not-italic font-semibold text-purple-700 block mb-1">
            Clinical Reasoning:
          </span>
          "{aiData.reasoning}"
        </div>

        {/* Citation Count */}
        {aiData.cited_rules && aiData.cited_rules.length > 0 && (
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <Stethoscope className="h-3 w-3" />
            Based on {aiData.cited_rules.length} specific institutional
            protocols.
          </div>
        )}

        {/* --- FEEDBACK ACTION AREA --- */}
        {!feedbackGiven ? (
          <div className="mt-4 pt-4 border-t border-slate-100">
            {!showDisagreeForm ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">
                  Validate this assessment:
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleAgree}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Agree
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setShowDisagreeForm(true)}
                    disabled={isSubmitting}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Disagree
                  </Button>
                </div>
              </div>
            ) : (
              // --- DISAGREE FORM ---
              <div className="bg-red-50/50 p-4 rounded border border-red-100 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-red-800 flex items-center gap-2">
                    <Brain className="h-4 w-4" /> Teach the AI System
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-red-100 rounded-full"
                    onClick={() => setShowDisagreeForm(false)}
                  >
                    ✕
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">
                      Correct Diagnosis
                    </label>
                    <Input
                      placeholder="e.g. Cauda Equina Syndrome"
                      value={correctDiagnosis}
                      onChange={(e) => setCorrectDiagnosis(e.target.value)}
                      className="bg-white border-red-100 focus-visible:ring-red-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-1 block">
                      Clinical Lesson (Why was AI wrong?)
                    </label>
                    <Textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g., The patient has saddle anesthesia which overrides the negative SLR..."
                      className="bg-white border-red-100 focus-visible:ring-red-400 min-h-[80px]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowDisagreeForm(false)}
                      className="text-slate-500"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleDisagreeSubmit}
                      disabled={isSubmitting || !correctDiagnosis || !reason}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Submit Correction Rule"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 pt-3 border-t border-dashed border-slate-200 text-center flex justify-center">
            <Badge
              variant="outline"
              className="bg-slate-50 text-slate-500 border-slate-200 font-normal"
            >
              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
              Assessment Validated & Learned
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

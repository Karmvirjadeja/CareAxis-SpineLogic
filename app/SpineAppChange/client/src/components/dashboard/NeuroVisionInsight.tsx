import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import { Textarea } from "../../components/ui/textarea";
import {
  Eye,
  Brain,
  CheckCircle,
  XCircle,
  ScanLine,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import axios from "axios";

// --- Types matching Python Output ---
interface VisualFinding {
  structure?: string;
  location?: string;
  observation?: string;
  finding?: string;
  severity: string;
}

interface VisionResult {
  scan_quality: string;
  agreement_with_triage: "Yes" | "No" | "Partial";
  reasoning_vs_triage: string;
  visual_findings: VisualFinding[];
  critic_notes: string;
  final_radiological_diagnosis: string[];
  confidence: number;
}

interface NeuroVisionInsightProps {
  patientId: string;
  scanImages: File[]; // ✅ UPDATED: Accepts Array of files
  visionData: VisionResult;
  fullPatientData: any;
  onReset: () => void;
}

export function NeuroVisionInsight({
  patientId,
  scanImages, // ✅ UPDATED: Using plural
  visionData,
  fullPatientData,
  onReset,
}: NeuroVisionInsightProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [correction, setCorrection] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImageIdx, setCurrentImageIdx] = useState(0); // Track active image
  const { toast } = useToast();

  // Create preview URL for the CURRENTLY selected image
  const currentFile =
    scanImages && scanImages.length > 0 ? scanImages[currentImageIdx] : null;
  const imagePreviewUrl = currentFile ? URL.createObjectURL(currentFile) : null;

  // Helper to change image
  const nextImage = () => {
    setCurrentImageIdx((prev) => (prev + 1) % scanImages.length);
  };
  const prevImage = () => {
    setCurrentImageIdx(
      (prev) => (prev - 1 + scanImages.length) % scanImages.length,
    );
  };

  // --- ACTION 1: AGREE (Archive as Gold Standard) ---
  const handleAgree = async () => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("patient_context", JSON.stringify(fullPatientData));
      formData.append("vision_result", JSON.stringify(visionData));
      formData.append("doctor_id", "doc_hackathon_user");

      await axios.post("http://localhost:8000/archive_vision_case", formData);

      toast({
        title: "Case Archived",
        description: "Visual diagnosis saved to Gold Standard Library.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
      onReset();
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to archive case.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // --- ACTION 2: DISAGREE (Teach the Bot) ---
  const handleLearn = async () => {
    if (!correction) return;
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("correction", correction);
      formData.append("doctor_id", "doc_hackathon_user");

      await axios.post("http://localhost:8000/learn_from_mistake", formData);

      toast({
        title: "Visual Rule Learned",
        description: "Neuro-Vision memory updated successfully.",
        className: "bg-blue-50 border-blue-200 text-blue-800",
      });
      setShowFeedback(false);
    } catch (e) {
      toast({ title: "Learning Failed", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const correlationColor =
    visionData.agreement_with_triage === "Yes"
      ? "border-l-green-500 bg-green-50/50"
      : visionData.agreement_with_triage === "No"
        ? "border-l-red-500 bg-red-50/50"
        : "border-l-amber-500 bg-amber-50/50";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
      {/* --- LEFT COLUMN: EVIDENCE --- */}
      <div className="space-y-4">
        {/* 1. Image Preview Carousel */}
        <Card className="overflow-hidden border-2 border-slate-100 shadow-sm">
          <CardHeader className="bg-slate-50 pb-2 flex flex-row justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-md text-slate-700">
              <ScanLine className="w-4 h-4 text-purple-600" />
              Analyzed Scan Source
            </CardTitle>
            {scanImages.length > 1 && (
              <span className="text-xs text-slate-500 font-medium bg-white px-2 py-1 rounded border">
                Image {currentImageIdx + 1} of {scanImages.length}
              </span>
            )}
          </CardHeader>

          <div className="relative bg-black min-h-[400px] flex items-center justify-center group">
            {imagePreviewUrl ? (
              <img
                src={imagePreviewUrl}
                alt={`MRI Scan ${currentImageIdx + 1}`}
                className="max-h-[500px] w-auto object-contain transition-opacity duration-300"
              />
            ) : (
              <div className="text-gray-500 text-sm">No Image Loaded</div>
            )}

            {/* Navigation Buttons (Only if > 1 image) */}
            {scanImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm border border-white/10">
              Quality: {visionData.scan_quality}
            </div>
          </div>

          {/* Thumbnails */}
          {scanImages.length > 1 && (
            <div className="flex gap-2 p-2 bg-slate-50 overflow-x-auto border-t border-slate-100">
              {scanImages.map((file, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrentImageIdx(idx)}
                  className={`h-12 w-12 flex-shrink-0 cursor-pointer border-2 rounded overflow-hidden transition-all ${idx === currentImageIdx ? "border-purple-600 ring-2 ring-purple-100" : "border-transparent opacity-60 hover:opacity-100"}`}
                >
                  <img
                    src={URL.createObjectURL(file)}
                    className="h-full w-full object-cover"
                    alt="thumbnail"
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 2. Triage Correlation Alert */}
        <Alert className={`border-l-4 shadow-sm ${correlationColor}`}>
          <Brain className="h-4 w-4" />
          <AlertTitle className="font-semibold mb-1">
            Correlation with Radix Assessment
          </AlertTitle>
          <AlertDescription className="text-sm text-slate-700 leading-relaxed">
            {visionData.reasoning_vs_triage}
          </AlertDescription>
        </Alert>
      </div>

      {/* --- RIGHT COLUMN: DIAGNOSIS & REASONING --- */}
      <div className="space-y-4">
        <Card className="h-full border-l-4 border-l-purple-600 shadow-md">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl text-purple-900 flex items-center gap-2">
                  <Eye className="w-5 h-5" /> Voxel Assessment
                </CardTitle>
                <CardDescription>Multimodal analysis</CardDescription>
              </div>
              <Badge
                variant="outline"
                className="text-lg px-3 py-1 bg-purple-50 text-purple-700 border-purple-200"
              >
                {(visionData.confidence * 100).toFixed(0)}% Conf.
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 1: Visual Findings */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <ScanLine className="w-3 h-3" /> Step 1: Visual Inventory
              </h4>
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {visionData.visual_findings.map((finding, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-start p-3 bg-slate-50 rounded border border-slate-100 text-sm hover:bg-slate-100 transition-colors"
                  >
                    <span className="font-semibold text-slate-700">
                      {finding.structure || finding.location}
                    </span>
                    <span className="text-slate-600 text-right">
                      {finding.observation || finding.finding}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: The Critic Check */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Brain className="w-3 h-3" /> Step 2: Institutional Memory Check
              </h4>
              <div className="text-sm text-slate-600 italic bg-blue-50/50 p-3 rounded border-l-2 border-blue-300 flex gap-2">
                <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                "{visionData.critic_notes}"
              </div>
            </div>

            {/* Step 3: Final Diagnosis */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                Step 3: Final Impression
              </h4>
              <div className="flex flex-wrap gap-2">
                {visionData.final_radiological_diagnosis.map((dx, i) => (
                  <Badge
                    key={i}
                    className="bg-purple-600 hover:bg-purple-700 text-sm py-1 px-3 shadow-sm"
                  >
                    {dx}
                  </Badge>
                ))}
              </div>
            </div>

            {/* --- ACTION BUTTONS --- */}
            <div className="pt-6 flex flex-col gap-3">
              {!showFeedback ? (
                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    onClick={handleAgree}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isProcessing ? "Archiving..." : "Validate & Archive"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setShowFeedback(true)}
                    disabled={isProcessing}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Missed Something?
                  </Button>
                </div>
              ) : (
                <div className="bg-red-50 p-4 rounded-lg border border-red-100 animate-in slide-in-from-top-2 shadow-inner">
                  <h4 className="font-semibold text-red-800 text-sm mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Teach the Vision Bot
                  </h4>
                  <Textarea
                    placeholder="e.g. 'You missed the subtle pars defect at L5.' or 'This is actually an artifact, not a fracture.'"
                    className="bg-white mb-3 border-red-200 focus:border-red-400 focus:ring-red-400"
                    value={correction}
                    onChange={(e) => setCorrection(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFeedback(false)}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleLearn}
                      disabled={isProcessing || !correction}
                    >
                      {isProcessing ? "Learning..." : "Submit Rule"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// client/src/pages/comprehensive-doctor-view.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  FileText,
  User,
  Calendar,
  Edit3,
  Check,
  Upload,
  ScanLine,
  Loader2,
} from "lucide-react";
import { z } from "zod";
import { BodyAnnotationViewer } from "../components/ui/body-annotation-viewer.jsx";
import { Assessment } from "../../shared/schema.js";
import { Button } from "../components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card.jsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form.jsx";
import { Textarea } from "../components/ui/textarea.jsx";
import { Input } from "../components/ui/input.jsx";
import { useToast } from "../hooks/use-toast.js";
import { MedicalCheckbox } from "../components/ui/medical-checkbox.jsx";
import { MEDICAL_ADVICE_OPTIONS } from "../lib/medical-advice.js";
import { Badge } from "../components/ui/badge.jsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs.jsx";
import { apiRequest } from "../lib/queryClient.js";
import { useAuth } from "../context/AuthContext.jsx";
import type { Patient } from "../../shared/schema.js";
import { cn } from "../lib/utils.js";
import axios from "axios"; // <--- ADD THIS
import { NeuroVisionInsight } from "../components/dashboard/NeuroVisionInsight"; // <--- ADD THIS
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select.jsx";
import { StraightLegRaiseTest } from "../components/ui/straight-leg-raise-test.jsx";
import { SpurlingsTest } from "../components/ui/spurlings-test.jsx";
import { EnhancedGaitAssessment } from "../components/ui/enhanced-gait-assessment.jsx";
import { TandemWalkAssessment } from "../components/ui/tandem-walk-assessment.jsx";
import { AiInsightCard } from "../components/dashboard/AiInsightCard";
// SCHEMAS FOR DOCTOR-ONLY EDITABLE SECTIONS
const doctorEditableSchema = z.object({
  // Assistant Input (5) - Doctor can edit
  expectedDiagnosis: z.string().default(""),
  patientAdvice: z.string().default(""),

  // Red Flag Questions (2.8) - Doctor can edit
  bowelBladderIncontinence: z.boolean().default(false),
  limbWeakness: z.boolean().default(false),
  unbearablePain: z.boolean().default(false),

  // Medical History (2.9 fields) - Doctor can edit
  previousSurgeries: z.string().default(""),
  currentMedications: z.string().default(""),
  previousTreatments: z.string().default(""),

  // Trauma (part of 2.1) - Doctor can edit
  trauma: z.object({
    sportsInjury: z.boolean().default(false),
    fightWeapon: z.boolean().default(false),
    whiplash: z.boolean().default(false),
    accident: z.boolean().default(false),
    fall: z.boolean().default(false),
    satHeavy: z.boolean().default(false),
    severeCoughSneeze: z.boolean().default(false),
  }),
});
type DoctorEditableData = z.infer<typeof doctorEditableSchema>;

const assessmentFormSchema = z.object({
  patientId: z.string().min(1, "Patient selection is required"),
  doctorId: z.string().min(1, "Doctor ID is required"),
  medicalDiagnosis: z.string().min(1, "Diagnosis is required"),
  additionalNotes: z.string().default(""),
});
type AssessmentFormData = z.infer<typeof assessmentFormSchema> & {
  selectedTreatments: string[];
};

// MAIN COMPONENT
export default function ComprehensiveDoctorView() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("patient-details");
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);
  const [isEditingDocSection, setIsEditingDocSection] = useState<
    "trauma" | "medicalHistory" | "redFlags" | "assistantInput" | null
  >(null);

  // --- 🆕 INSERT START: VISION BOT STATE ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visionResult, setVisionResult] = useState<any>(null);
  // --- 🆕 INSERT END ---

  const treatmentLabels = useMemo(
    () => new Map(MEDICAL_ADVICE_OPTIONS.map((opt) => [opt.id, opt.label])),
    [],
  );

  const assessmentForm = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      patientId: params.patientId || "",
      doctorId: user?._id || "",
      medicalDiagnosis: "",
      additionalNotes: "",
    },
  });
  // ... existing patientAssessments query ...

  // 🆕 ADD THIS: Fetch the AI Triage Data + Doctor Feedback (The "Truth")
  const { data: aiAssessmentsList = [] } = useQuery<ExtendedAssessment[]>({
    queryKey: [`/api/aiassessments/patient/${params.patientId}`], // <--- HITS THE CORRECT COLLECTION
    enabled: !!params.patientId,
  });
  const { data: selectedPatient, isLoading: patientLoading } =
    useQuery<Patient>({
      queryKey: ["/api/patients", params.patientId],
      enabled: !!params.patientId,
    });

  // --- REPLACE YOUR EXISTING useQuery WITH THIS ---
  const { data: patientAssessments = [], isLoading: assessmentsLoading } =
    useQuery<ExtendedAssessment[]>({
      queryKey: [`/api/assessments/patient/${params.patientId}`],
      enabled: !!params.patientId,
    });

  // Form for Doctor's Edits (populated on load)
  const doctorEditForm = useForm<DoctorEditableData>({
    resolver: zodResolver(doctorEditableSchema),
    mode: "onSubmit",
  });

  // Populate Doctor Edit form on patient load
  useEffect(() => {
    if (selectedPatient) {
      doctorEditForm.reset({
        expectedDiagnosis: selectedPatient.expectedDiagnosis || "",
        patientAdvice: selectedPatient.patientAdvice || "",
        bowelBladderIncontinence:
          selectedPatient.bowelBladderIncontinence || false,
        limbWeakness: selectedPatient.limbWeakness || false,
        unbearablePain: selectedPatient.unbearablePain || false,
        previousSurgeries: selectedPatient.previousSurgeries || "",
        currentMedications: selectedPatient.currentMedications || "",
        previousTreatments: selectedPatient.previousTreatments || "",
        trauma: selectedPatient.trauma || {
          sportsInjury: false,
          fightWeapon: false,
          whiplash: false,
          accident: false,
          fall: false,
          satHeavy: false,
          severeCoughSneeze: false,
        },
      });
    }
  }, [selectedPatient, doctorEditForm]);

  useEffect(() => {
    if (user?._id && params.patientId) {
      assessmentForm.setValue("doctorId", user._id);
      assessmentForm.setValue("patientId", params.patientId);
    }
  }, [user, params.patientId, assessmentForm]);

  // Mutation for updating Doctor-Editable fields
  const updatePatientFieldsMutation = useMutation({
    mutationFn: async (updatedFields: Partial<Patient>) => {
      if (!params.patientId)
        throw new Error("Patient ID is missing for update.");

      const response = await apiRequest(
        "PUT",
        `/api/patients/${params.patientId}`,
        updatedFields,
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Patient Record Updated",
        description: "Doctor's fields saved successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/patients", params.patientId],
      });
      setIsEditingDocSection(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description:
          error.message || "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Generic handler for saving a doctor-editable section
  const onSubmitDoctorEdit = useCallback(
    (section: typeof isEditingDocSection) => async () => {
      let fieldsToUpdate: Partial<Patient> = {};
      const data = doctorEditForm.getValues();
      let keysToValidate: Array<keyof DoctorEditableData> = [];

      // Determine the specific fields/keys to update and validate based on the section
      if (section === "redFlags") {
        keysToValidate = [
          "bowelBladderIncontinence",
          "limbWeakness",
          "unbearablePain",
        ];
        fieldsToUpdate = {
          bowelBladderIncontinence: data.bowelBladderIncontinence,
          limbWeakness: data.limbWeakness,
          unbearablePain: data.unbearablePain,
        };
      } else if (section === "medicalHistory") {
        keysToValidate = [
          "previousSurgeries",
          "currentMedications",
          "previousTreatments",
        ];
        fieldsToUpdate = {
          previousSurgeries: data.previousSurgeries,
          currentMedications: data.currentMedications,
          previousTreatments: data.previousTreatments,
        };
      } else if (section === "trauma") {
        keysToValidate = ["trauma"];
        fieldsToUpdate = {
          trauma: data.trauma,
        };
      } else if (section === "assistantInput") {
        keysToValidate = ["expectedDiagnosis", "patientAdvice"];
        fieldsToUpdate = {
          expectedDiagnosis: data.expectedDiagnosis,
          patientAdvice: data.patientAdvice,
        };
      }

      const isValid = await doctorEditForm.trigger(keysToValidate as any);

      if (isValid) {
        updatePatientFieldsMutation.mutate(fieldsToUpdate);
      } else {
        toast({
          title: "Validation Error",
          description: "Please check the highlighted fields.",
          variant: "destructive",
        });
      }
    },
    [doctorEditForm, updatePatientFieldsMutation, toast, params.patientId],
  );

  const onSubmitAssessment = (data: AssessmentFormData) => {
    if (selectedTreatments.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one treatment option",
        variant: "destructive",
      });
      return;
    }
    if (!user?._id) {
      toast({
        title: "Authentication Error",
        description: "Doctor ID is missing. Please log in again.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmittingAssessment(true);
    submitAssessmentMutation.mutate({
      ...data,
      selectedTreatments,
    });
  };

  const submitAssessmentMutation = useMutation({
    mutationFn: async (data: AssessmentFormData) => {
      const response = await apiRequest("POST", "/api/assessments", {
        ...data,
        selectedTreatments,
      });
      return response.json();
    },
    onSuccess: () => {
      setIsSubmittingAssessment(false);
      toast({
        title: "Assessment Completed Successfully! ✓",
        description: `Diagnosis and treatment plan for ${selectedPatient?.fullName} has been saved.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      queryClient.invalidateQueries({
        queryKey: [`/api/assessments/patient/${params.patientId}`],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/patients", params.patientId],
      });
      assessmentForm.reset();
      setSelectedTreatments([]);
      setActiveTab("assessment-history");
    },
    onError: (error: any) => {
      setIsSubmittingAssessment(false);
      toast({
        title: "Assessment Submission Failed",
        description:
          error.message || "Failed to submit assessment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleTreatment = (treatment: string) => {
    setSelectedTreatments((prev) =>
      prev.includes(treatment)
        ? prev.filter((t) => t !== treatment)
        : [...prev, treatment],
    );
  };

  // Helper to render boolean object as badges
  const renderBadges = (
    dataObject: Record<string, any> | undefined,
    variant: "secondary" | "destructive" | "outline" = "secondary",
    showOthers = true,
  ) => {
    if (!dataObject || Object.keys(dataObject).length === 0) {
      return <p className="text-gray-500 text-sm">None</p>;
    }
    const trueKeys = Object.entries(dataObject)
      .filter(([key, value]) => value === true && key !== "others")
      .map(([key]) => key);

    const otherValue = dataObject.others;

    if (
      trueKeys.length === 0 &&
      (!showOthers || !otherValue || otherValue.length === 0)
    ) {
      return <p className="text-gray-500 text-sm">None</p>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {trueKeys.map((key) => (
          <Badge key={key} variant={variant} className="text-xs">
            {key
              .replace(/([A-Z])/g, " $1")
              .trim()
              .replace(/^./, (str) => str.toUpperCase())}
          </Badge>
        ))}
        {showOthers &&
          otherValue &&
          typeof otherValue === "string" &&
          otherValue.length > 0 && (
            <Badge variant={variant} className="text-xs">
              Other: {otherValue}
            </Badge>
          )}
      </div>
    );
  };

  // Helper to render simple text fields
  const renderTextField = (
    value: string | number | undefined,
    placeholder: string = "None reported",
  ) => (
    <p className="text-gray-700 bg-gray-50 p-3 rounded text-sm whitespace-pre-line">
      {value !== null && value !== undefined && value !== ""
        ? value
        : placeholder}
    </p>
  );

  // Helper to render true/false status
  const renderBooleanStatus = (
    value: boolean | undefined,
    label: string,
    isRedFlag = false,
  ) => {
    const statusText = value ? "Yes" : "No";
    const textColor = value
      ? isRedFlag
        ? "text-red-700"
        : "text-green-700"
      : "text-gray-700";
    return (
      <div className="flex justify-between p-2 bg-white border border-gray-200 rounded-lg">
        <span className="font-medium text-sm text-gray-700">{label}</span>
        <span className={cn("font-semibold text-sm", textColor)}>
          {statusText}
        </span>
      </div>
    );
  };

  // Helper to render motion limitations
  const renderMovementLimitations = (movements: string[] | undefined) => {
    if (!movements || movements.length === 0) {
      return <p className="text-sm text-green-700">None noted.</p>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {movements.map((m) => (
          <Badge key={m} variant="destructive" className="text-xs">
            {m.replace(/_/g, " ").replace(/^./, (str) => str.toUpperCase())}
          </Badge>
        ))}
      </div>
    );
  };

  // --- Doctor Editable Component (Wrapper for inline editing) ---
  const DoctorEditFormCard = ({
    title,
    section,
    children,
  }: {
    title: string;
    section: "trauma" | "medicalHistory" | "redFlags" | "assistantInput";
    children: React.ReactNode;
  }) => {
    const isEditing = isEditingDocSection === section;
    const isLoading = updatePatientFieldsMutation.isPending;

    return (
      <Card
        className={cn(
          section === "redFlags" && "border-red-400 bg-red-50",
          "relative",
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          {/* REMOVED: (Doctor Editable) */}
          <CardTitle
            className={cn("text-lg", section === "redFlags" && "text-red-700")}
          >
            {title}
          </CardTitle>
          <div className="flex space-x-2">
            {isEditing ? (
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={onSubmitDoctorEdit(section)}
                  disabled={isLoading}
                >
                  <Check className="w-4 h-4 mr-1" />
                  {isLoading ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Reset form part to original patient values before canceling
                    doctorEditForm.reset(selectedPatient);
                    setIsEditingDocSection(null);
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditingDocSection(section)}
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Form {...doctorEditForm}>{children}</Form>
        </CardContent>
      </Card>
    );
  };
  // --- END Doctor Editable Component ---
  // --- 🆕 INSERT START: VISION BOT LOGIC ---
  // --- PASTE THIS AFTER IMPORTS ---
  type ExtendedAssessment = Assessment & {
    aiResponse?: any;
    doctorFeedback?: any;
  };
  // 1. Get Latest Assessment Data for Context Handoff
  // We grab the most recent AI opinion + Doctor feedback to guide the Vision Bot
  const latestAiRecord = aiAssessmentsList?.[0];
  const aiData = latestAiRecord?.aiResponse;
  const doctorFeedback = latestAiRecord?.doctorFeedback;
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  console.log("🔍 DEBUG - AI ASSESSMENT DATA:", aiAssessmentsList);

  const handleAnalyzeScans = async () => {
    if (selectedFiles.length === 0) {
      toast({ title: "No files selected", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);

    // 2. Prepare the "Magic Context" Payload
    // Merges Patient Demographics + Triage Bot Opinion + Doctor Feedback
    const contextPayload = {
      ...selectedPatient,
      aiTriageResponse: aiData || {},
      doctorFeedback: doctorFeedback || null,
    };

    const formData = new FormData();
    formData.append("patient_context", JSON.stringify(contextPayload));

    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      // 3. Call Python Backend (Port 8000)
      const response = await axios.post(
        "http://localhost:8000/analyze_images",
        formData,
      );
      setVisionResult(response.data);

      toast({
        title: "Deep Analysis Complete",
        description:
          "Neuro-Vision has correlated visuals with the clinical record.",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Analysis Failed",
        description: "Could not connect to the Neuro-Vision server.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  // --- 🆕 INSERT END ---
  if (patientLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center">
              <User className="w-6 h-6 mr-2" />
              Doctor Assessment - {selectedPatient.fullName}
            </CardTitle>
            <Button
              variant="ghost"
              onClick={() => setLocation("/doctor")}
              className="text-primary hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList>
              <TabsTrigger value="patient-details">Details</TabsTrigger>
              <TabsTrigger value="medical-history">History</TabsTrigger>
              <TabsTrigger value="examination">Examination</TabsTrigger>
              <TabsTrigger value="compensation-expectation">
                Comp. & Expectation
              </TabsTrigger>
              <TabsTrigger value="assistant-input">Assistant Input</TabsTrigger>
              <TabsTrigger value="doctor-assessment">Diagnosis</TabsTrigger>
              <TabsTrigger value="neuro-vision">Vision Agent</TabsTrigger>
              <TabsTrigger value="assessment-history">History</TabsTrigger>
            </TabsList>

            {/* ------------------------------------- */}
            {/* 1. Patient Details (NON-EDITABLE) */}
            {/* ------------------------------------- */}
            <TabsContent value="patient-details" className="space-y-6">
              <Card>
                <CardHeader>
                  {/* REMOVED: (Non-Editable) */}
                  <CardTitle className="text-lg">1. Personal Details</CardTitle>
                  {/* REMOVED: explicit restriction note */}
                  <p className="text-sm text-gray-500">
                    Demographic details are locked after initial creation.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <span className="font-medium">Full Name:</span>{" "}
                      {selectedPatient.fullName}
                    </div>
                    <div>
                      <span className="font-medium">Age:</span>{" "}
                      {selectedPatient.age} years
                    </div>
                    <div>
                      <span className="font-medium">Gender:</span>{" "}
                      {selectedPatient.gender}
                    </div>
                    <div>
                      <span className="font-medium">Mobile Number:</span>{" "}
                      {selectedPatient.mobile}
                    </div>
                    <div>
                      <span className="font-medium">Occupation:</span>{" "}
                      {selectedPatient.occupation || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      <Badge>{selectedPatient.status}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                {/* REMOVED: (Assistant Input - Read-Only) */}
                <CardHeader>
                  <CardTitle className="text-lg">
                    2. Chief Complaint & General Symptoms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-1">Chief Complaint</h4>
                    {renderTextField(selectedPatient.chiefComplaint)}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">General Symptoms</h4>
                    {renderTextField(selectedPatient.generalSymptoms)}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ------------------------------------- */}
            {/* 2. Medical History (Mixed Editable/Read-Only) */}
            {/* ------------------------------------- */}
            <TabsContent value="medical-history" className="space-y-6">
              {/* Doctor Editable: Trauma */}
              {/* REMOVED: (Doctor Editable) */}
              <DoctorEditFormCard title="2.1 Trauma History" section="trauma">
                {isEditingDocSection === "trauma" ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    {Object.entries(selectedPatient.trauma).map(([key]) => (
                      <Controller
                        key={key}
                        name={`trauma.${
                          key as keyof DoctorEditableData["trauma"]
                        }`}
                        control={doctorEditForm.control}
                        render={({ field }) => (
                          <FormItem>
                            <MedicalCheckbox
                              id={`trauma-doc-${key}`}
                              label={key
                                .replace(/([A-Z])/g, " $1")
                                .trim()
                                .replace(/^./, (str) => str.toUpperCase())}
                              checked={field.value}
                              onChange={(checked) => field.onChange(checked)}
                            />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                ) : (
                  renderBadges(selectedPatient.trauma, "secondary")
                )}
              </DoctorEditFormCard>

              {/* Doctor Editable: Medical History (2.9 fields) */}
              {/* REMOVED: (Doctor Editable) */}
              <DoctorEditFormCard
                title="2.2 Past Medical & Surgical History"
                section="medicalHistory"
              >
                <div className="space-y-4">
                  <FormLabel className="font-medium">
                    Previous Surgeries
                  </FormLabel>
                  {isEditingDocSection === "medicalHistory" ? (
                    <FormField
                      control={doctorEditForm.control}
                      name="previousSurgeries"
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Previous surgeries"
                          rows={2}
                        />
                      )}
                    />
                  ) : (
                    renderTextField(selectedPatient.previousSurgeries)
                  )}

                  <FormLabel className="font-medium">
                    Current Medications
                  </FormLabel>
                  {isEditingDocSection === "medicalHistory" ? (
                    <FormField
                      control={doctorEditForm.control}
                      name="currentMedications"
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Current medications"
                          rows={2}
                        />
                      )}
                    />
                  ) : (
                    renderTextField(selectedPatient.currentMedications)
                  )}

                  <FormLabel className="font-medium">
                    Previous Treatments for Spine/Pain Issues
                  </FormLabel>
                  {isEditingDocSection === "medicalHistory" ? (
                    <FormField
                      control={doctorEditForm.control}
                      name="previousTreatments"
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          placeholder="Previous treatments"
                          rows={2}
                        />
                      )}
                    />
                  ) : (
                    renderTextField(selectedPatient.previousTreatments)
                  )}
                </div>
              </DoctorEditFormCard>

              {/* Assistant Editable (Read-Only for Doctor) - Co-Morbid Conditions */}
              <Card>
                {/* REMOVED: (Assistant Input - Read-Only) */}
                <CardHeader>
                  <CardTitle className="text-lg">
                    2.3 Co-Morbid Conditions & Symptoms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Co-Morbid Conditions</h4>
                    {renderBadges(selectedPatient.conditions, "secondary")}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      Constitutional Symptoms
                    </h4>
                    {renderBadges(
                      selectedPatient.constitutionalSymptoms,
                      "secondary",
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      Additional Conditions
                    </h4>
                    {renderBadges(
                      selectedPatient.additionalConditions,
                      "secondary",
                    )}
                  </div>
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">Exercise Habits</h4>
                    {renderTextField(
                      selectedPatient.exerciseHabits?.types?.join(", ") ||
                        selectedPatient.exerciseHabits?.otherExercise,
                      "Not specified",
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ------------------------------------- */}
            {/* 3. Examination (Read-Only & Doctor Editable Red Flags) */}
            {/* ------------------------------------- */}
            <TabsContent value="examination" className="space-y-6">
              <Card>
                {/* REMOVED: (Assistant Input - Read-Only) */}
                <CardHeader>
                  <CardTitle className="text-lg">
                    3.1 Pain Assessment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <span className="font-medium">Pain Level:</span>{" "}
                      {selectedPatient.painLevel || "N/A"}/10
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span>{" "}
                      {selectedPatient.painDuration || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Progression:</span>{" "}
                      {selectedPatient.painProgression || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Start:</span>{" "}
                      {selectedPatient.painStart || "N/A"}
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-1">Pain Aggravators</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedPatient.painAggravators?.map((a) => (
                        <Badge key={a} variant="outline" className="text-xs">
                          {a}
                        </Badge>
                      ))}
                    </div>
                    {(!selectedPatient.painAggravators ||
                      selectedPatient.painAggravators.length === 0) &&
                      renderTextField("", "None reported")}
                  </div>
                </CardContent>
              </Card>

              {/* Doctor Editable: Red Flags (2.8) - Logical Placement in Examination Tab */}
              {/* REMOVED: (Doctor Editable) */}
              <DoctorEditFormCard
                title="3.2 Red Flag Questions"
                section="redFlags"
              >
                {isEditingDocSection === "redFlags" ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    {[
                      {
                        name: "bowelBladderIncontinence",
                        label: "Bowel/Bladder Incontinence",
                      },
                      { name: "limbWeakness", label: "Limb Weakness" },
                      { name: "unbearablePain", label: "Unbearable Pain" },
                    ].map(({ name, label }) => (
                      <Controller
                        key={name}
                        name={name as keyof DoctorEditableData}
                        control={doctorEditForm.control}
                        render={({ field }) => (
                          <FormItem>
                            <MedicalCheckbox
                              id={`red-flag-doc-${name}`}
                              label={label}
                              checked={field.value}
                              onChange={(checked) => field.onChange(checked)}
                            />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {selectedPatient.bowelBladderIncontinence && (
                      <Badge variant="destructive" className="text-xs">
                        Bowel/Bladder Incontinence (YES)
                      </Badge>
                    )}
                    {selectedPatient.limbWeakness && (
                      <Badge variant="destructive" className="text-xs">
                        Limb Weakness (YES)
                      </Badge>
                    )}
                    {selectedPatient.unbearablePain && (
                      <Badge variant="destructive" className="text-xs">
                        Unbearable Pain (YES)
                      </Badge>
                    )}
                    {!(
                      selectedPatient.bowelBladderIncontinence ||
                      selectedPatient.limbWeakness ||
                      selectedPatient.unbearablePain
                    ) && (
                      <p className="text-sm text-green-700">
                        No red flags reported.
                      </p>
                    )}
                  </div>
                )}
              </DoctorEditFormCard>

              {/* Assistant Editable Pain Map (Read-Only for Doctor) */}
              <Card>
                {/* REMOVED: (Assistant Input - Read-Only) */}
                <CardHeader>
                  <CardTitle className="text-lg">3.3 3D Pain Mapping</CardTitle>
                </CardHeader>
                <CardContent>
                  <BodyAnnotationViewer
                    title="Patient Pain Mapping"
                    selectedParts={selectedPatient?.bodyPainMap || []}
                    gender={
                      (selectedPatient.gender as "male" | "female") || "male"
                    }
                    onPartSelect={() => {}}
                    showIntensity={true}
                    isReadOnly={true}
                  />
                </CardContent>
              </Card>

              {/* Assistant-Editable Examination Data (Read-Only) */}
              <Card>
                {/* REMOVED: (Assistant Input - Read-Only) */}
                <CardHeader>
                  <CardTitle className="text-lg">
                    3.4 Examination Tests
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h5 className="font-semibold text-gray-800">
                    Gait & Walking
                  </h5>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Gait Pattern:</span>{" "}
                      {selectedPatient.gaitPattern || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Tandem Walk:</span>{" "}
                      {selectedPatient.canWalkInLine || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Uses Aid:</span>{" "}
                      {selectedPatient.usesWalkingAid
                        ? `Yes (${selectedPatient.walkingAidType || "N/A"})`
                        : "No"}
                    </div>
                    <div>
                      <span className="font-medium">Listed Gait Details:</span>{" "}
                      {selectedPatient.listedSide &&
                      selectedPatient.listedPainRelation
                        ? `${selectedPatient.listedSide} (${selectedPatient.listedPainRelation})`
                        : "N/A"}
                    </div>
                  </div>

                  <h5 className="font-semibold text-gray-800 pt-4 border-t">
                    Range of Motion (ROM) & Pain
                  </h5>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p>
                        <span className="font-medium">Spine Pain:</span>{" "}
                        {selectedPatient.experiencesPain ? "✅ Yes" : "❌ No"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Spine Limitations:</span>{" "}
                        {renderMovementLimitations(
                          selectedPatient.unableMovements,
                        )}
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="font-medium">Neck Pain:</span>{" "}
                        {selectedPatient.neckPain ? "✅ Yes" : "❌ No"}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Neck Limitations:</span>{" "}
                        {renderMovementLimitations(
                          selectedPatient.unableNeckMovements,
                        )}
                      </p>
                    </div>
                  </div>

                  <h5 className="font-semibold text-gray-800 pt-4 border-t">
                    Provocative & Functional Tests
                  </h5>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium block mb-1">
                        Spurling's Test:
                      </span>
                      <Badge
                        variant={
                          selectedPatient.spurlingTest === "no_pain"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {selectedPatient.spurlingTest?.replace(/_/g, " ") ||
                          "N/A"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <span className="font-medium block">R-SLR:</span>
                      {renderTextField(
                        selectedPatient.straightLegRaisingTest?.rightLegActive?.replace(
                          /_/g,
                          " ",
                        ),
                        "N/A",
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="font-medium block">L-SLR:</span>
                      {renderTextField(
                        selectedPatient.straightLegRaisingTest?.leftLegActive?.replace(
                          /_/g,
                          " ",
                        ),
                        "N/A",
                      )}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 text-sm pt-4 border-t">
                    {renderBooleanStatus(
                      selectedPatient.functionalTests?.canStandOnRightLeg,
                      "Can Stand on R-Leg",
                    )}
                    {renderBooleanStatus(
                      selectedPatient.functionalTests?.canStandOnLeftLeg,
                      "Can Stand on L-Leg",
                    )}
                    {renderBooleanStatus(
                      selectedPatient.functionalTests?.canDoPartialSquat,
                      "Can Do Partial Squat",
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ------------------------------------- */}
            {/* 4. Compensation & Expectation (Read-Only) */}
            {/* ------------------------------------- */}
            <TabsContent value="compensation-expectation" className="space-y-6">
              <Card>
                {/* REMOVED: (Assistant Input - Read-Only) */}
                <CardHeader>
                  <CardTitle className="text-lg">
                    4. Functional Assessment & Expectations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h4 className="font-semibold mb-2">
                    4.1 Functional Assessment
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        selectedPatient.functionalAssessment?.manageActivities
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      <span className="font-medium">Daily Activities:</span>
                      <span>
                        {selectedPatient.functionalAssessment?.manageActivities
                          ? " ✅ Manageable"
                          : " ❌ Difficult"}
                      </span>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        selectedPatient.functionalAssessment
                          ?.acceptableCurrentStatus
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      <span className="font-medium">Current Status:</span>
                      <span>
                        {selectedPatient.functionalAssessment
                          ?.acceptableCurrentStatus
                          ? " ✅ Acceptable"
                          : " ❌ Unacceptable"}
                      </span>
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        selectedPatient.functionalAssessment
                          ?.socialEventParticipation
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      <span className="font-medium">Social Events:</span>
                      <span>
                        {selectedPatient.functionalAssessment
                          ?.socialEventParticipation
                          ? " ✅ Can attend"
                          : " ❌ Cannot attend"}
                      </span>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-2">
                      4.2 Treatment Expectations
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.treatmentExpectations?.length
                        ? selectedPatient.treatmentExpectations?.map(
                            (expectation) => (
                              <Badge key={expectation} variant="outline">
                                {expectation.replace(/_/g, " ")}
                              </Badge>
                            ),
                          )
                        : renderTextField(
                            "",
                            "No specific expectations listed.",
                          )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ------------------------------------- */}
            {/* 5. Assistant Input (Doctor-Editable) */}
            {/* ------------------------------------- */}
            <TabsContent value="assistant-input" className="space-y-6">
              {/* REMOVED: (Doctor Editable) */}
              <DoctorEditFormCard
                title="5. Assistant's Input"
                section="assistantInput"
              >
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      Expected Diagnosis (5.1)
                    </h4>
                    {isEditingDocSection === "assistantInput" ? (
                      <FormField
                        control={doctorEditForm.control}
                        name="expectedDiagnosis"
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="Patient's expected diagnosis"
                            rows={3}
                          />
                        )}
                      />
                    ) : (
                      renderTextField(
                        selectedPatient.expectedDiagnosis,
                        "No expected diagnosis provided",
                      )
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      Additional Advice/Information (5.2)
                    </h4>
                    {isEditingDocSection === "assistantInput" ? (
                      <FormField
                        control={doctorEditForm.control}
                        name="patientAdvice"
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            placeholder="Any additional advice or information from the assistant"
                            rows={3}
                          />
                        )}
                      />
                    ) : (
                      renderTextField(
                        selectedPatient.patientAdvice,
                        "No additional information provided",
                      )
                    )}
                  </div>
                </div>
              </DoctorEditFormCard>
            </TabsContent>

            {/* ------------------------------------- */}
            {/* 🆕 NEURO-VISION TAB (The Vision Bot) */}
            {/* ------------------------------------- */}
            <TabsContent value="neuro-vision" className="mt-6">
              {!visionResult ? (
                // STATE A: UPLOAD FORM
                <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                  <CardHeader className="text-center">
                    <div className="mx-auto bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                      <Upload className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-slate-800">
                      Upload MRI Scans
                    </CardTitle>
                    <div className="text-sm text-muted-foreground mt-2">
                      Neuro-Vision will analyze these scans using the <br />
                      <span className="font-semibold text-purple-600">
                        Triage Data & Doctor Feedback
                      </span>{" "}
                      currently in the database.
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-6 pb-10">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <input
                        type="file"
                        multiple
                        accept="image/*,.dcm"
                        onChange={handleFileSelect}
                        className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-slate-600 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </div>

                    {selectedFiles.length > 0 && (
                      <Badge variant="secondary" className="px-4 py-1">
                        {selectedFiles.length} file(s) selected
                      </Badge>
                    )}

                    <Button
                      size="lg"
                      className="bg-purple-600 hover:bg-purple-700 min-w-[200px]"
                      onClick={handleAnalyzeScans}
                      disabled={isAnalyzing || selectedFiles.length === 0}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deep
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <ScanLine className="mr-2 h-4 w-4" /> Run Neuro-Vision
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <NeuroVisionInsight
                  patientId={params.patientId!}
                  scanImages={selectedFiles}
                  visionData={visionResult}
                  fullPatientData={{
                    ...selectedPatient,
                    aiTriageResponse: aiData,
                    doctorFeedback,
                  }}
                  onReset={() => {
                    setVisionResult(null);
                    setSelectedFiles([]);
                  }}
                />
              )}
            </TabsContent>

            {/* ------------------------------------- */}
            {/* 6. Doctor Assessment (Diagnosis) */}
            {/* ------------------------------------- */}
            <TabsContent value="doctor-assessment" className="space-y-6">
              {/* ✅ CORRECTED BLOCK START */}
              {(selectedPatient as any)?.aiTriageResponse && (
                <AiInsightCard
                  patientId={params.patientId!}
                  aiData={(selectedPatient as any).aiTriageResponse}
                  fullPatientData={selectedPatient}
                  hasFeedback={!!(selectedPatient as any).doctorFeedback}
                />
              )}
              <Form {...assessmentForm}>
                <form
                  onSubmit={assessmentForm.handleSubmit(onSubmitAssessment)}
                  className="space-y-6"
                >
                  <FormField
                    control={assessmentForm.control}
                    name="medicalDiagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Diagnosis</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter your professional diagnosis..."
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel className="text-sm font-medium">
                      Recommended Treatments
                    </FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                      {MEDICAL_ADVICE_OPTIONS.map((option) => (
                        <MedicalCheckbox
                          key={option.id}
                          id={option.id}
                          label={option.label}
                          checked={selectedTreatments.includes(option.id)}
                          onChange={() => toggleTreatment(option.id)}
                        />
                      ))}
                    </div>
                  </div>

                  <FormField
                    control={assessmentForm.control}
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Any additional observations or recommendations..."
                            className="min-h-[80px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <Button
                      type="submit"
                      disabled={
                        isSubmittingAssessment ||
                        submitAssessmentMutation.isPending
                      }
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isSubmittingAssessment ||
                      submitAssessmentMutation.isPending ? (
                        <>
                          <Save className="w-4 h-4 mr-2 animate-spin" />
                          Submitting Assessment...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Complete Assessment
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            {/* ------------------------------------- */}
            {/* 7. Assessment History */}
            {/* ------------------------------------- */}
            <TabsContent value="assessment-history" className="space-y-6">
              <h3 className="text-lg font-semibold">Assessment History</h3>
              {assessmentsLoading ? (
                <div>Loading assessments...</div>
              ) : patientAssessments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    No Assessments Yet
                  </h3>
                </div>
              ) : (
                <div className="space-y-6">
                  {patientAssessments
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt!).getTime() -
                        new Date(a.createdAt!).getTime(),
                    )
                    .map((assessment, index) => (
                      <Card key={assessment._id} className="bg-blue-50">
                        <CardHeader>
                          <CardTitle className="flex justify-between items-center text-base">
                            <span>
                              Assessment #{patientAssessments.length - index}
                            </span>
                            <span className="text-sm font-normal text-gray-600 flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              {new Date(assessment.createdAt!).toLocaleString()}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">
                              Medical Diagnosis
                            </h4>
                            <div className="bg-white p-3 rounded-md border text-sm">
                              {assessment.medicalDiagnosis}
                            </div>
                          </div>
                          {assessment.recommendedTreatments &&
                            assessment.recommendedTreatments.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-gray-800 mb-2">
                                  Recommended Treatments
                                </h4>
                                <div className="bg-white p-3 rounded-md border flex flex-wrap gap-2">
                                  {assessment.recommendedTreatments.map(
                                    (treatmentId) => (
                                      <Badge
                                        key={treatmentId}
                                        variant="secondary"
                                      >
                                        {treatmentLabels.get(treatmentId) ||
                                          treatmentId.replace(/_/g, " ")}
                                      </Badge>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          {assessment.additionalNotes && (
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2">
                                Additional Notes
                              </h4>
                              <div className="bg-white p-3 rounded-md border text-sm">
                                {assessment.additionalNotes}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}

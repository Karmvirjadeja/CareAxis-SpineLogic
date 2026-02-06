import { useState, useMemo, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, ChevronLeft, ChevronRight, Save } from "lucide-react";
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
import { Input } from "../components/ui/input.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select.jsx";
import { Textarea } from "../components/ui/textarea.jsx";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group.jsx";
import { useToast } from "../hooks/use-toast.js";
import { ToastAction } from "../components/ui/toast.jsx"; // Import ToastAction
import { MedicalCheckbox } from "../components/ui/medical-checkbox.jsx";
import { PainScale } from "../components/ui/pain-scale.jsx";
import { UnifiedBodyModel } from "../components/ui/unified-3d-body-model.jsx";
import { EnhancedGaitAssessment } from "../components/ui/enhanced-gait-assessment.jsx";
import { TandemWalkAssessment } from "../components/ui/tandem-walk-assessment.jsx";
import { StraightLegRaiseTest } from "../components/ui/straight-leg-raise-test.jsx";
import { SpurlingsTest } from "../components/ui/spurlings-test.jsx";
import { EnhancedRangeOfMotion } from "../components/ui/enhanced-range-of-motion.jsx";
import { PAIN_AGGRAVATORS } from "../lib/medical-advice.js";
import { apiRequest } from "../lib/queryClient.js";
import { useAuth } from "../context/AuthContext.jsx";
import { ProtectedRoute } from "../components/auth/ProtectedRoute.jsx";
import {
  insertPatientSchema,
  type InsertPatient,
  type Patient,
} from "../../shared/schema.js";
import { cn } from "../lib/utils.js";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog.jsx";

type PatientFormData = InsertPatient;

const sections = [
  { id: 1, title: "Patient Details" },
  { id: 2, title: "Medical Details & History" },
  { id: 3, title: "Examination" },
  { id: 4, title: "Compensation & Expectation" },
  { id: 5, title: "Assistant Input" },
];

const getFieldsForSection = (section: number): any[] => {
  switch (section) {
    case 1:
      return ["fullName", "age", "gender", "mobile", "occupation"];
    case 2:
      return [
        "conditions",
        "constitutionalSymptoms",
        "trauma",
        "chiefComplaint",
        "generalSymptoms",
        "painLevel",
        "painLocation",
        "bodyPainMap",
        "painDuration",
        "painProgression",
        "painStart",
        "painAggravators",
        "additionalConditions",
        "previousSurgeries",
        "currentMedications",
        "previousTreatments",
        "bowelBladderIncontinence",
        "limbWeakness",
        "unbearablePain",
      ];
    case 3:
      return [
        "canWalkOnRightToe",
        "canWalkOnLeftToe",
        "canWalkOnRightHeel",
        "canWalkOnLeftHeel",
        "canWalkInLine",
        "gaitPattern",
        "usesWalkingAid",
        "walkingAidType",
        "listedSide",
        "listedPainRelation",
        "unableMovements",
        "unableNeckMovements",
        "experiencesPain",
        "neckPain",
        "straightLegRaisingTest",
        "spurlingTest",
        "functionalTests",
      ];
    case 4:
      return ["functionalAssessment", "treatmentExpectations"];
    case 5:
      return ["expectedDiagnosis", "patientAdvice"];
    default:
      return [];
  }
};

const SectionWrapper = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => (
  <div className="animate-fade-in space-y-8">
    <div>
      <h2 className="text-2xl font-semibold mb-6 border-l-4 border-primary pl-4 text-gray-800">
        {title}
      </h2>
      <div className="space-y-10">{children}</div>
    </div>
  </div>
);

export default function PatientForm() {
  const [currentSection, setCurrentSection] = useState(1);
  const [, setLocation] = useLocation();
  const params = useParams();
  const patientId = params.patientId;
  const isEditMode = !!patientId;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editReason, setEditReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isAssistant = user?.role === "assistant";

  const [selectedAggravators, setSelectedAggravators] = useState<string[]>([]);
  const [bodyPainSelections, setBodyPainSelections] = useState<any[]>([]);
  const [selectedMovements, setSelectedMovements] = useState<string[]>([]);
  const [selectedNeckMovements, setSelectedNeckMovements] = useState<string[]>(
    []
  );
  const [individualMovementPain, setIndividualMovementPain] = useState<{
    [key: string]: boolean;
  }>({});

  const STORAGE_KEY = `patient_form_draft_${patientId || "new"}_${user?._id}`;

  const { data: existingPatient, isLoading: isLoadingPatient } =
    useQuery<Patient>({
      queryKey: ["/api/patients", patientId],
      enabled: isEditMode,
    });

  const form = useForm<PatientFormData>({
    resolver: zodResolver(insertPatientSchema),
    mode: "onSubmit",
    defaultValues: {
      fullName: "",
      age: undefined,
      gender: "",
      mobile: "",
      occupation: "",
      chiefComplaint: "",
      generalSymptoms: "",
      conditions: {
        diabetes: false,
        stroke: false,
        ihd: false,
        thyroid: false,
        ra: false,
        as: false,
        osteoporosis: false,
        hypertension: false,
        others: "",
      },
      constitutionalSymptoms: {
        anorexia: false,
        fever: false,
        weakness: false,
        nightPain: false,
        weightLoss: false,
      },
      trauma: {
        sportsInjury: false,
        fightWeapon: false,
        whiplash: false,
        accident: false,
        fall: false,
        satHeavy: false,
        severeCoughSneeze: false,
      },
      painLocation: {
        cervical: false,
        thoracic: false,
        lumbar: false,
        sacral: false,
      },
      additionalConditions: {
        imbalance: false,
        vertigo: false,
        nausea: false,
        handwritingChanges: false,
      },
      previousSurgeries: "",
      currentMedications: "",
      previousTreatments: "",
      exerciseHabits: { types: [], otherExercise: "" },
      functionalTests: {
        canStandOnRightLeg: false,
        canStandOnLeftLeg: false,
        canDoPartialSquat: false,
        rightKneeHurtOnSquat: false,
        leftKneeHurtOnSquat: false,
      },
      painAggravators: [],
      unableMovements: [],
      unableNeckMovements: [],
      bodyPainMap: [],
      canWalkOnRightToe: false,
      canWalkOnLeftToe: false,
      canWalkOnRightHeel: false,
      canWalkOnLeftHeel: false,
      gaitPattern: "",
      usesWalkingAid: false,
      walkingAidType: "",
      listedSide: "",
      listedPainRelation: "",
      painDuration: "",
      painProgression: "",
      painStart: "",
      experiencesPain: false,
      neckPain: false,
      bowelBladderIncontinence: false,
      limbWeakness: false,
      unbearablePain: false,
      spinalMovements: {
        bendingForward: false,
        bendingBackwards: false,
        bendingOnSide: false,
        leftTwisting: false,
        rightTwisting: false,
      },
      neckMovements: {
        bendingForward: false,
        bendingBackwards: false,
        bendingOnSide: false,
        leftTwisting: false,
        rightTwisting: false,
      },
      straightLegRaisingTest: {},
      functionalAssessment: {
        manageActivities: false,
        acceptableCurrentStatus: false,
        socialEventParticipation: false,
      },
      treatmentExpectations: [],
      expectedDiagnosis: "",
      patientAdvice: "",
    },
  });

  const {
    canWalkOnRightToe,
    canWalkOnLeftToe,
    canWalkOnRightHeel,
    canWalkOnLeftHeel,
    canWalkInLine,
    gaitPattern,
    usesWalkingAid,
    walkingAidType,
    listedSide,
    listedPainRelation,
    gender,
  } = form.watch();

  const gaitAssessmentValues = useMemo(
    () => ({
      canWalkOnRightToe,
      canWalkOnLeftToe,
      canWalkOnRightHeel,
      canWalkOnLeftHeel,
      canWalkInLine,
      gaitPattern,
      usesWalkingAid,
      walkingAidType,
      listedSide,
      listedPainRelation,
    }),
    [
      canWalkOnRightToe,
      canWalkOnLeftToe,
      canWalkOnRightHeel,
      canWalkOnLeftHeel,
      canWalkInLine,
      gaitPattern,
      usesWalkingAid,
      walkingAidType,
      listedSide,
      listedPainRelation,
    ]
  );

  // --- LAYER 1: AUTO-SAVE TO LOCAL STORAGE ---
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, STORAGE_KEY]);

  // --- LAYER 2: NON-INTRUSIVE RESTORE ---
  useEffect(() => {
    if (!isEditMode) {
      const savedDraft = localStorage.getItem(STORAGE_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          // CHANGE: No window.confirm(). We use a passive Toast instead.
          // This fulfills "it should not ask" (interrupting you).
          toast({
            title: "Draft Found",
            description: "You have unsaved work. Want to resume?",
            duration: 8000, // Stays for 8 seconds
            action: (
              <ToastAction
                altText="Restore Draft"
                onClick={() => {
                  form.reset({ ...form.getValues(), ...parsed });
                  if (parsed.painAggravators)
                    setSelectedAggravators(parsed.painAggravators);
                  if (parsed.bodyPainMap)
                    setBodyPainSelections(parsed.bodyPainMap);
                  if (parsed.unableMovements)
                    setSelectedMovements(parsed.unableMovements);
                  if (parsed.unableNeckMovements)
                    setSelectedNeckMovements(parsed.unableNeckMovements);

                  toast({
                    title: "Restored",
                    description: "Form populated from draft.",
                  });
                }}
              >
                Restore
              </ToastAction>
            ),
          });
        } catch (e) {
          console.error("Failed to parse draft", e);
        }
      }
    }
  }, [isEditMode, STORAGE_KEY, form, toast]);

  useEffect(() => {
    if (isEditMode && existingPatient) {
      form.reset(existingPatient);
      setSelectedAggravators(existingPatient.painAggravators || []);
      setBodyPainSelections(existingPatient.bodyPainMap || []);
      setSelectedMovements(existingPatient.unableMovements || []);
      setSelectedNeckMovements(existingPatient.unableNeckMovements || []);
    }
  }, [existingPatient, isEditMode, form]);

  const handleSaveAndNext = async () => {
    const fields = getFieldsForSection(currentSection);
    const isValid = await form.trigger(fields as any);

    if (!isValid) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields in this section.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const formData = form.getValues();
    const patientData = {
      ...formData,
      painAggravators: selectedAggravators,
      bodyPainMap: bodyPainSelections,
      unableMovements: selectedMovements,
      unableNeckMovements: selectedNeckMovements,
      submittedByAssistantId: user?._id,
      assignedDoctorId: user?.assignedDoctorId,
    };

    try {
      if (currentSection === 1 && !patientId) {
        const res = await apiRequest("POST", "/api/patients", {
          ...patientData,
          status: "pending",
        });
        const newPatient = await res.json();
        toast({ title: "Patient Created", description: "Details saved." });
        setLocation(`/patient/${newPatient._id}`, { replace: true });
        setCurrentSection((prev) => prev + 1);
      } else {
        const targetId = patientId;
        if (!targetId) throw new Error("Missing patient ID");

        const isFinalStep = currentSection === sections.length;

        // Block Asssitant editing ONLY if patient is already submitted (not pending)
        if (
          isEditMode &&
          isAssistant &&
          isFinalStep &&
          existingPatient?.status !== "pending"
        ) {
          setIsDialogOpen(true);
          setIsSaving(false);
          return;
        }

        await apiRequest("PUT", `/api/patients/${targetId}`, patientData);

        if (isFinalStep) {
          localStorage.removeItem(STORAGE_KEY); // Clean up
          toast({
            title: "Assessment Complete",
            description: "Submitted successfully.",
          });
          queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
          setLocation(user?.role === "assistant" ? "/assistant" : "/");
        } else {
          setCurrentSection((prev) => prev + 1);
          toast({ title: "Saved", description: "Progress saved." });
        }
      }
    } catch (error: any) {
      console.error("Save failed:", error);
      toast({
        title: "Connection Warning",
        description:
          "Could not save to server. Your data is safe in this browser.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalEditSubmit = async () => {
    if (!editReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please enter a reason.",
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    try {
      const formData = form.getValues();
      const patientData = {
        ...formData,
        painAggravators: selectedAggravators,
        bodyPainMap: bodyPainSelections,
        unableMovements: selectedMovements,
        unableNeckMovements: selectedNeckMovements,
        submittedByAssistantId: user?._id,
        assignedDoctorId: user?.assignedDoctorId,
      };

      await apiRequest("POST", `/api/patients/${patientId}/edit-request`, {
        reason: editReason,
        changes: patientData,
      });

      localStorage.removeItem(STORAGE_KEY);
      toast({
        title: "Edit Request Sent",
        description: "Submitted for approval.",
      });
      setIsDialogOpen(false);
      setEditReason("");
      setLocation("/assistant");
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAggravator = (aggravator: string) =>
    setSelectedAggravators((prev) =>
      prev.includes(aggravator)
        ? prev.filter((a) => a !== aggravator)
        : [...prev, aggravator]
    );
  const handlePartSelect = (part: any) => {
    if (part.intensity === 0) {
      setBodyPainSelections((prev) => prev.filter((p) => p.id !== part.id));
    } else {
      setBodyPainSelections((prev) => {
        const existing = prev.find((p) => p.id === part.id);
        if (existing) {
          return prev.map((p) => (p.id === part.id ? part : p));
        }
        return [...prev, part];
      });
    }
  };
  const handleIntensityChange = (partId: string, intensity: number) => {
    setBodyPainSelections((prev) =>
      prev.map((part) => (part.id === partId ? { ...part, intensity } : part))
    );
  };

  // --- UNLOCKED: Assistants can edit everything ---
  const isFieldDisabled = (sectionId: number, fieldName: string): boolean => {
    // We return false so ALL fields are editable by the assistant.
    return false;
  };

  if (isEditMode && isLoadingPatient) {
    return (
      <main className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </main>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["assistant", "doctor", "masterDoctor"]}>
      {isEditMode && isAssistant && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Reason for Change</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Textarea
                placeholder="Why are you editing this?"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleFinalEditSubmit}
                disabled={!editReason.trim() || isSaving}
              >
                {isSaving ? "Sending..." : "Send"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="medical-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">
                {isEditMode
                  ? "Edit Patient Assessment"
                  : "New Patient Assessment"}
              </CardTitle>
              <Button
                variant="ghost"
                onClick={() =>
                  setLocation(user?.role === "assistant" ? "/assistant" : "/")
                }
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {/* Steps Indicator */}
            <div className="mb-12 border-b pb-4">
              <ol className="grid grid-cols-5 w-full">
                {sections.map((section, index) => (
                  <li
                    key={section.id}
                    className={cn(
                      "flex items-center justify-center",
                      index !== 0 && "relative"
                    )}
                  >
                    {index !== 0 && (
                      <div
                        className={cn(
                          "absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-full",
                          currentSection > section.id
                            ? "bg-primary"
                            : "bg-gray-200"
                        )}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (patientId || section.id <= currentSection)
                          setCurrentSection(section.id);
                      }}
                      className="flex flex-col items-center justify-center gap-2 z-10"
                    >
                      <div
                        className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-full transition-colors",
                          currentSection >= section.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        )}
                      >
                        <span className="font-bold text-lg">{section.id}</span>
                      </div>
                      <p
                        className={cn(
                          "text-xs font-medium hidden md:block",
                          currentSection >= section.id
                            ? "text-primary"
                            : "text-gray-500"
                        )}
                      >
                        {section.title}
                      </p>
                    </button>
                  </li>
                ))}
              </ol>
            </div>

            <Form {...form}>
              <form className="space-y-12">
                {currentSection === 1 && (
                  <SectionWrapper title="1. Patient Details">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isFieldDisabled(1, "fullName")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                inputMode="numeric"
                                onChange={(e) => {
                                  const val = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                  );
                                  field.onChange(
                                    val ? parseInt(val, 10) : undefined
                                  );
                                }}
                                disabled={isFieldDisabled(1, "age")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={isFieldDisabled(1, "gender")}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="mobile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile Number *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="tel"
                                disabled={isFieldDisabled(1, "mobile")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="occupation"
                        render={({ field }) => (
                          <FormItem className="lg:col-span-2">
                            <FormLabel>Occupation</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isFieldDisabled(1, "occupation")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </SectionWrapper>
                )}

                {currentSection === 2 && (
                  <SectionWrapper title="2. Medical Details & History">
                    <div className="space-y-4">
                      <FormLabel className="font-medium">
                        2.1 Co-Morbid Conditions
                      </FormLabel>
                      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[
                          "diabetes",
                          "stroke",
                          "ihd",
                          "thyroid",
                          "ra",
                          "as",
                          "osteoporosis",
                          "hypertension",
                        ].map((k) => (
                          <FormField
                            key={k}
                            control={form.control}
                            name={`conditions.${k as "diabetes"}`}
                            render={({ field }) => (
                              <FormItem>
                                <MedicalCheckbox
                                  id={`cond-${k}`}
                                  label={k.toUpperCase()}
                                  checked={field.value}
                                  onChange={field.onChange}
                                  disabled={isFieldDisabled(2, "conditions")}
                                />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormField
                        control={form.control}
                        name="conditions.others"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Others</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={isFieldDisabled(
                                  2,
                                  "conditions.others"
                                )}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-4">
                      <FormLabel className="font-medium">
                        Constitutional Symptoms
                      </FormLabel>
                      <div className="grid md:grid-cols-3 gap-4">
                        {[
                          "anorexia",
                          "fever",
                          "weakness",
                          "nightPain",
                          "weightLoss",
                        ].map((k) => (
                          <FormField
                            key={k}
                            control={form.control}
                            name={`constitutionalSymptoms.${k as "anorexia"}`}
                            render={({ field }) => (
                              <FormItem>
                                <MedicalCheckbox
                                  id={`symp-${k}`}
                                  label={k
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())}
                                  checked={field.value}
                                  onChange={field.onChange}
                                  disabled={isFieldDisabled(
                                    2,
                                    "constitutionalSymptoms"
                                  )}
                                />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <FormLabel className="font-medium">Trauma</FormLabel>
                      <div className="grid md:grid-cols-3 gap-4">
                        {[
                          "sportsInjury",
                          "fightWeapon",
                          "whiplash",
                          "accident",
                          "fall",
                          "satHeavy",
                          "severeCoughSneeze",
                        ].map((k) => (
                          <FormField
                            key={k}
                            control={form.control}
                            name={`trauma.${k as "sportsInjury"}`}
                            render={({ field }) => (
                              <FormItem>
                                <MedicalCheckbox
                                  id={`trauma-${k}`}
                                  label={k
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())}
                                  checked={field.value}
                                  onChange={field.onChange}
                                  disabled={isFieldDisabled(2, "trauma")}
                                />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <FormField
                      control={form.control}
                      name="chiefComplaint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>2.2 Chief Complaint</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              disabled={isFieldDisabled(2, "chiefComplaint")}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="generalSymptoms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>General Symptoms</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              disabled={isFieldDisabled(2, "generalSymptoms")}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="space-y-4">
                      <FormLabel className="font-medium">
                        2.4 Pain Assessment
                      </FormLabel>
                      <div className="grid lg:grid-cols-2 gap-8">
                        <FormField
                          control={form.control}
                          name="painLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Pain Level (1-10)</FormLabel>
                              <FormControl>
                                <PainScale
                                  value={field.value}
                                  onChange={field.onChange}
                                  disabled={isFieldDisabled(2, "painLevel")}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <div>
                          <FormLabel>Pain Location</FormLabel>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {["cervical", "thoracic", "lumbar", "sacral"].map(
                              (k) => (
                                <FormField
                                  key={k}
                                  control={form.control}
                                  name={`painLocation.${k as "cervical"}`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <MedicalCheckbox
                                        id={`loc-${k}`}
                                        label={
                                          k.charAt(0).toUpperCase() + k.slice(1)
                                        }
                                        checked={field.value}
                                        onChange={field.onChange}
                                        disabled={isFieldDisabled(
                                          2,
                                          "painLocation"
                                        )}
                                      />
                                    </FormItem>
                                  )}
                                />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <UnifiedBodyModel
                      title="2.5 Interactive Body Pain Mapping"
                      selectedParts={bodyPainSelections}
                      onPartSelect={handlePartSelect}
                      onIntensityChange={handleIntensityChange}
                      showIntensity={true}
                      gender={(gender as "male" | "female") || "male"}
                    />
                    <div className="space-y-4">
                      <FormLabel className="font-medium">
                        2.5 Pain Details
                      </FormLabel>
                      <div className="grid md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="painDuration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={isFieldDisabled(2, "painDuration")}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="acute">Acute</SelectItem>
                                  <SelectItem value="subacute">
                                    Sub-acute
                                  </SelectItem>
                                  <SelectItem value="chronic">
                                    Chronic
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="painProgression"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Progression</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={isFieldDisabled(2, "painProgression")}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="worsened">
                                    Worsened
                                  </SelectItem>
                                  <SelectItem value="improved">
                                    Improved
                                  </SelectItem>
                                  <SelectItem value="status_quo">
                                    Status Quo
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="painStart"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={isFieldDisabled(2, "painStart")}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="suddenly">
                                    Suddenly
                                  </SelectItem>
                                  <SelectItem value="gradually">
                                    Gradually
                                  </SelectItem>
                                  <SelectItem value="after_event">
                                    After an Event
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div data-disabled={isFieldDisabled(2, "painAggravators")}>
                      <FormLabel className="font-medium">
                        2.6 How Does It Aggravate?
                      </FormLabel>
                      <div className="grid md:grid-cols-3 gap-2 mt-2">
                        {PAIN_AGGRAVATORS.map((aggravator) => (
                          <MedicalCheckbox
                            key={aggravator}
                            id={aggravator}
                            label={aggravator}
                            checked={selectedAggravators.includes(aggravator)}
                            onChange={() => toggleAggravator(aggravator)}
                            disabled={isFieldDisabled(2, "painAggravators")}
                          />
                        ))}
                      </div>
                    </div>
                    <div
                      className="space-y-2"
                      data-disabled={isFieldDisabled(2, "additionalConditions")}
                    >
                      <FormLabel className="font-medium">
                        2.7 Additional Conditions
                      </FormLabel>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          "imbalance",
                          "vertigo",
                          "nausea",
                          "handwritingChanges",
                        ].map((k) => (
                          <FormField
                            key={k}
                            control={form.control}
                            name={`additionalConditions.${k as "imbalance"}`}
                            render={({ field }) => (
                              <FormItem>
                                <MedicalCheckbox
                                  id={`add-cond-${k}`}
                                  label={k
                                    .replace(/([A-Z])/g, " $1")
                                    .replace(/^./, (str) => str.toUpperCase())}
                                  checked={field.value}
                                  onChange={field.onChange}
                                  disabled={isFieldDisabled(
                                    2,
                                    "additionalConditions"
                                  )}
                                />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <FormLabel className="font-medium">
                        2.9 Medical History
                      </FormLabel>
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="previousSurgeries"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Previous Surgeries</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  disabled={isFieldDisabled(
                                    2,
                                    "previousSurgeries"
                                  )}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="currentMedications"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Medications</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  disabled={isFieldDisabled(
                                    2,
                                    "currentMedications"
                                  )}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="previousTreatments"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Previous Treatments</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  disabled={isFieldDisabled(
                                    2,
                                    "previousTreatments"
                                  )}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div
                      data-disabled={isFieldDisabled(
                        2,
                        "bowelBladderIncontinence"
                      )}
                    >
                      <FormLabel className="font-medium text-red-600">
                        2.8 Red Flag Questions
                      </FormLabel>
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-2 space-y-2">
                        {[
                          {
                            name: "bowelBladderIncontinence",
                            label: "Bowel and Bladder Incontinence",
                          },
                          {
                            name: "limbWeakness",
                            label: "Is Weakness in the Limb",
                          },
                          { name: "unbearablePain", label: "Unbearable Pain" },
                        ].map(({ name, label }) => (
                          <FormField
                            key={name}
                            control={form.control}
                            name={name as "bowelBladderIncontinence"}
                            render={({ field }) => (
                              <FormItem>
                                <MedicalCheckbox
                                  id={`red-flag-${name}`}
                                  label={label}
                                  checked={field.value}
                                  onChange={field.onChange}
                                  disabled={isFieldDisabled(2, name)}
                                />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </SectionWrapper>
                )}

                {currentSection === 3 && (
                  <SectionWrapper title="3. Examination">
                    <EnhancedGaitAssessment
                      values={gaitAssessmentValues}
                      onChange={(fieldName, value) =>
                        form.setValue(fieldName, value, {
                          shouldValidate: true,
                        })
                      }
                    />
                    <TandemWalkAssessment
                      values={{
                        canWalkInLine: form.watch("canWalkInLine") || "",
                      }}
                      onChange={(fieldName, value) =>
                        form.setValue(fieldName, value, {
                          shouldValidate: true,
                        })
                      }
                    />
                    <EnhancedRangeOfMotion
                      spineMovements={selectedMovements}
                      neckMovements={selectedNeckMovements}
                      spineMovementPain={form.watch("experiencesPain")}
                      neckMovementPain={form.watch("neckPain")}
                      individualMovementPain={individualMovementPain}
                      onSpineMovementChange={setSelectedMovements}
                      onNeckMovementChange={setSelectedNeckMovements}
                      onSpineMovementPainChange={(value) =>
                        form.setValue("experiencesPain", value, {
                          shouldValidate: true,
                        })
                      }
                      onNeckMovementPainChange={(value) =>
                        form.setValue("neckPain", value, {
                          shouldValidate: true,
                        })
                      }
                      onIndividualMovementPainChange={(movement, hasPain) =>
                        setIndividualMovementPain((prev) => ({
                          ...prev,
                          [movement]: hasPain,
                        }))
                      }
                    />
                    <StraightLegRaiseTest
                      values={form.watch("straightLegRaisingTest")}
                      onChange={(fieldName, value) =>
                        form.setValue(fieldName, value, {
                          shouldValidate: true,
                        })
                      }
                    />
                    <SpurlingsTest
                      values={{
                        spurlingTest: form.watch("spurlingTest") || "",
                      }}
                      onChange={(fieldName, value) =>
                        form.setValue(fieldName, value, {
                          shouldValidate: true,
                        })
                      }
                    />
                    <div className="space-y-4">
                      <FormLabel className="font-medium">
                        Additional Functional Tests
                      </FormLabel>
                      <div className="bg-gray-50 border rounded-xl p-4">
                        <FormLabel className="text-sm font-medium mb-3 block">
                          Can you stand on one leg?
                        </FormLabel>
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="functionalTests.canStandOnRightLeg"
                            render={({ field }) => (
                              <FormItem>
                                <MedicalCheckbox
                                  id="stand-right"
                                  label="Right Leg"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  disabled={isFieldDisabled(
                                    3,
                                    "functionalTests"
                                  )}
                                />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="functionalTests.canStandOnLeftLeg"
                            render={({ field }) => (
                              <FormItem>
                                <MedicalCheckbox
                                  id="stand-left"
                                  label="Left Leg"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  disabled={isFieldDisabled(
                                    3,
                                    "functionalTests"
                                  )}
                                />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <div className="bg-gray-50 border rounded-xl p-4">
                        <FormField
                          control={form.control}
                          name="functionalTests.canDoPartialSquat"
                          render={({ field }) => (
                            <FormItem>
                              <MedicalCheckbox
                                id="can-squat"
                                label="Can you do a partial squat for 5 seconds?"
                                checked={field.value}
                                onChange={field.onChange}
                                disabled={isFieldDisabled(3, "functionalTests")}
                              />
                            </FormItem>
                          )}
                        />
                        {form.watch("functionalTests.canDoPartialSquat") && (
                          <div className="mt-4 pt-4 border-t">
                            <FormLabel className="text-sm font-medium mb-3 block">
                              Does the knee hurt while doing it?
                            </FormLabel>
                            <div className="grid md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="functionalTests.rightKneeHurtOnSquat"
                                render={({ field }) => (
                                  <FormItem>
                                    <MedicalCheckbox
                                      id="right-knee-hurt"
                                      label="Right Knee"
                                      checked={field.value}
                                      onChange={field.onChange}
                                      disabled={isFieldDisabled(
                                        3,
                                        "functionalTests"
                                      )}
                                    />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="functionalTests.leftKneeHurtOnSquat"
                                render={({ field }) => (
                                  <FormItem>
                                    <MedicalCheckbox
                                      id="left-knee-hurt"
                                      label="Left Knee"
                                      checked={field.value}
                                      onChange={field.onChange}
                                      disabled={isFieldDisabled(
                                        3,
                                        "functionalTests"
                                      )}
                                    />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </SectionWrapper>
                )}

                {currentSection === 4 && (
                  <SectionWrapper title="4. Compensation & Expectation">
                    <div
                      data-disabled={isFieldDisabled(4, "functionalAssessment")}
                    >
                      <FormLabel className="font-medium">
                        4.1 Functional Assessment
                      </FormLabel>
                      <div className="space-y-4 mt-2">
                        {[
                          "manageActivities",
                          "acceptableCurrentStatus",
                          "socialEventParticipation",
                        ].map((key, index) => (
                          <FormField
                            key={key}
                            control={form.control}
                            name={`functionalAssessment.${
                              key as "manageActivities"
                            }`}
                            render={({ field }) => (
                              <FormItem className="p-4 border rounded-lg bg-gray-50">
                                <FormLabel>
                                  {index === 0
                                    ? "Are you able to manage your day-to-day activities properly?"
                                    : index === 1
                                    ? "Is the status currently present acceptable to you?"
                                    : "Can you attend all the social events that you want to attend?"}
                                </FormLabel>
                                <FormControl>
                                  <RadioGroup
                                    onValueChange={(value) =>
                                      field.onChange(value === "yes")
                                    }
                                    value={field.value ? "yes" : "no"}
                                    className="flex items-center space-x-4 pt-2"
                                    disabled={isFieldDisabled(
                                      4,
                                      "functionalAssessment"
                                    )}
                                  >
                                    <FormItem className="flex items-center space-x-2">
                                      <FormControl>
                                        <RadioGroupItem
                                          value="yes"
                                          id={`${key}-yes`}
                                        />
                                      </FormControl>
                                      <FormLabel htmlFor={`${key}-yes`}>
                                        Yes
                                      </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2">
                                      <FormControl>
                                        <RadioGroupItem
                                          value="no"
                                          id={`${key}-no`}
                                        />
                                      </FormControl>
                                      <FormLabel htmlFor={`${key}-no`}>
                                        No
                                      </FormLabel>
                                    </FormItem>
                                  </RadioGroup>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                    <div
                      data-disabled={isFieldDisabled(
                        4,
                        "treatmentExpectations"
                      )}
                    >
                      <FormLabel className="font-medium">
                        4.2 Treatment Expectations
                      </FormLabel>
                      <div className="grid md:grid-cols-2 gap-2 mt-2">
                        {[
                          { v: "to_play_sports", l: "To play sports" },
                          {
                            v: "to_be_able_to_travel",
                            l: "To be able to travel",
                          },
                          {
                            v: "to_carry_on_daily_life",
                            l: "To carry on day-to-day life",
                          },
                          { v: "to_be_pain_free", l: "To be pain-free" },
                        ].map(({ v, l }) => (
                          <FormField
                            key={v}
                            control={form.control}
                            name="treatmentExpectations"
                            render={({ field }) => (
                              <FormItem>
                                <MedicalCheckbox
                                  id={`exp-${v}`}
                                  label={l}
                                  checked={(field.value || []).includes(v)}
                                  onChange={(c) => {
                                    const val = field.value || [];
                                    field.onChange(
                                      c
                                        ? [...val, v]
                                        : val.filter((i) => i !== v)
                                    );
                                  }}
                                  disabled={isFieldDisabled(
                                    4,
                                    "treatmentExpectations"
                                  )}
                                />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </SectionWrapper>
                )}

                {currentSection === 5 && (
                  <SectionWrapper title="5. Assistant Input">
                    <FormField
                      control={form.control}
                      name="expectedDiagnosis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            5.1 Patient's Expected Diagnosis
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Patient's thoughts..."
                              rows={4}
                              disabled={isFieldDisabled(5, "expectedDiagnosis")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="patientAdvice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>5.2 Additional Advice</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Additional info..."
                              rows={4}
                              disabled={isFieldDisabled(5, "patientAdvice")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </SectionWrapper>
                )}

                <div className="flex justify-between pt-8 border-t mt-12 sticky bottom-0 bg-white p-4 z-10 shadow-up">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentSection((p) => p - 1)}
                    disabled={currentSection === 1 || isSaving}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSaveAndNext}
                    disabled={isSaving}
                    className={cn(
                      currentSection === sections.length &&
                        "bg-green-600 hover:bg-green-700"
                    )}
                  >
                    {isSaving ? (
                      "Saving..."
                    ) : currentSection < sections.length ? (
                      <>
                        <Save className="w-4 h-4 mr-2" /> Save & Next{" "}
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" /> Finish & Submit
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </ProtectedRoute>
  );
}

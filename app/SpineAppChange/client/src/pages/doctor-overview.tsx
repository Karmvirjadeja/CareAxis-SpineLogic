// client/src/pages/doctor-overview.tsx

import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  FileText,
  User,
  Edit3,
  Check,
  X,
  Eye,
  Calendar,
  ClipboardList,
} from "lucide-react";
import { z } from "zod";

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
import { Textarea } from "../components/ui/textarea.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select.jsx";
import { useToast } from "../hooks/use-toast.js";
import { MedicalCheckbox } from "../components/ui/medical-checkbox.jsx";
import { PhotorealisticBodyModel } from "../components/ui/photorealistic-3d-body-model.jsx";
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
import type { Patient, Assessment } from "../../shared/schema.js";

const assessmentFormSchema = z.object({
  patientId: z.string().min(1, "Patient selection is required"),
  doctorId: z.string().min(1, "Doctor ID is required"),
  medicalDiagnosis: z.string().min(1, "Diagnosis is required"),
  additionalNotes: z.string().default(""),
});

const patientEditSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  age: z.number().min(1, "Age must be a positive number"),
  gender: z.string().min(1, "Gender is required"),
  mobile: z.string().min(1, "Mobile number is required"),
  occupation: z.string().optional(),
});

type AssessmentFormData = z.infer<typeof assessmentFormSchema> & {
  selectedTreatments: string[];
};
type PatientEditData = z.infer<typeof patientEditSchema>;

export default function ComprehensiveDoctorView() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [activeTab, setActiveTab] = useState("patient-info");

  const assessmentForm = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      patientId: params.patientId || "",
      doctorId: user?._id || "",
      medicalDiagnosis: "",
      additionalNotes: "",
    },
  });

  const patientEditForm = useForm<PatientEditData>({
    resolver: zodResolver(patientEditSchema),
    mode: "onSubmit",
  });

  const { data: selectedPatient, isLoading: patientLoading } =
    useQuery<Patient>({
      queryKey: ["/api/patients", params.patientId],
      enabled: !!params.patientId,
    });

  const { data: patientAssessments = [], isLoading: assessmentsLoading } =
    useQuery<Assessment[]>({
      queryKey: ["/api/assessments", "patient", params.patientId],
      enabled: !!params.patientId,
    });

  useEffect(() => {
    if (selectedPatient) {
      patientEditForm.reset({
        fullName: selectedPatient.fullName,
        age: selectedPatient.age,
        gender: selectedPatient.gender,
        mobile: selectedPatient.mobile,
        occupation: selectedPatient.occupation || "",
      });
    }
  }, [selectedPatient, patientEditForm]);

  const submitAssessmentMutation = useMutation({
    mutationFn: (data: AssessmentFormData) =>
      apiRequest("POST", "/api/assessments", data),
    onSuccess: () => {
      toast({ title: "Assessment Submitted Successfully!" });
      queryClient.invalidateQueries({
        queryKey: ["/api/assessments", "patient", params.patientId],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/patients", params.patientId],
      });
      setActiveTab("assessments");
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });

  const onSubmitAssessment = (data: AssessmentFormData) => {
    submitAssessmentMutation.mutate({ ...data, selectedTreatments });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center">
              <User className="w-6 h-6 mr-2" />
              Doctor Assessment - {selectedPatient?.fullName}
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
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="patient-info">Patient Info</TabsTrigger>
              <TabsTrigger value="medical-history">Medical History</TabsTrigger>
              <TabsTrigger value="pain-mapping">Pain Mapping</TabsTrigger>
              <TabsTrigger value="diagnosis">Diagnosis & Treatment</TabsTrigger>
              <TabsTrigger value="assessments">Assessment History</TabsTrigger>
            </TabsList>

            <TabsContent value="patient-info" className="space-y-6">
              {/* Full Patient Details */}
            </TabsContent>

            <TabsContent value="medical-history" className="space-y-6">
              {/* Full Medical History */}
            </TabsContent>

            <TabsContent value="pain-mapping" className="space-y-6">
              <PhotorealisticBodyModel
                title="Patient Pain Mapping (View Only)"
                selectedParts={selectedPatient?.bodyPainMap || []}
                onPartSelect={() => {}}
                showIntensity={true}
                gender={selectedPatient?.gender as "male" | "female"}
              />
            </TabsContent>

            <TabsContent value="diagnosis" className="space-y-6">
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
                      type="button"
                      variant="outline"
                      onClick={() => setLocation("/doctor")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitAssessmentMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {submitAssessmentMutation.isPending ? (
                        <>
                          <Save className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
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

            <TabsContent value="assessments" className="space-y-6">
              <h3 className="text-lg font-semibold">Assessment History</h3>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center">
                    <ClipboardList className="w-5 h-5 mr-2" />
                    All Assessments for {selectedPatient?.fullName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {assessmentsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-gray-500 mt-2">
                        Loading assessments...
                      </p>
                    </div>
                  ) : patientAssessments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold text-gray-800">
                        No Assessments Yet
                      </h3>
                      <p className="mt-2">
                        Complete the diagnosis on the 'Diagnosis & Treatment'
                        tab to create the first assessment.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {patientAssessments.map(
                        (assessment: Assessment, index: number) => (
                          <div
                            key={assessment._id}
                            className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <Badge variant="outline" className="bg-white">
                                Assessment #{patientAssessments.length - index}
                              </Badge>
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(
                                  assessment.createdAt || ""
                                ).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <h5 className="font-semibold text-gray-800 mb-2">
                                  Medical Diagnosis
                                </h5>
                                <div className="bg-white p-4 rounded-md border text-gray-700">
                                  {assessment.medicalDiagnosis}
                                </div>
                              </div>
                              {assessment.recommendedTreatments &&
                                assessment.recommendedTreatments.length > 0 && (
                                  <div>
                                    <h5 className="font-semibold text-gray-800 mb-2">
                                      Recommended Treatments
                                    </h5>
                                    <div className="bg-white p-4 rounded-md border flex flex-wrap gap-2">
                                      {assessment.recommendedTreatments.map(
                                        (treatment) => (
                                          <Badge
                                            key={treatment}
                                            variant="secondary"
                                            className="bg-blue-100 text-blue-800"
                                          >
                                            {treatment.replace(/_/g, " ")}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}

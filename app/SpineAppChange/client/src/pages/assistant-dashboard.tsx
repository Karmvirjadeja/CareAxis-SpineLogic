// client/src/pages/assistant-dashboard.tsx

import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  // FileText, // Unused
  // Clock, // Unused
  // CheckCircle, // Unused
  // User, // Unused
  MessageCircle,
  Eye,
  // Bell, // Unused
  ClipboardList, // New icon for 'View Report'
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { WelcomeAnimation } from "@/components/dashboard/WelcomeAnimation";
import { MEDICAL_ADVICE_OPTIONS } from "@/lib/medical-advice";
import { useToast } from "@/hooks/use-toast";
import type { Patient, Assessment } from "@shared/schema";

const ROWS_PER_PAGE = 5;

const PatientList = ({
  patients,
  onPatientClick, // For View Details (original form)
  onViewReportClick, // For View Report (assessment history)
}: {
  patients: Patient[];
  onPatientClick: (patientId: string) => void;
  onViewReportClick?: (patientId: string) => void; // Made optional for Pending tab
}) => {
  const { data: assessments = [] } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments"],
  });
  const treatmentLabels = useMemo(
    () => new Map(MEDICAL_ADVICE_OPTIONS.map((opt) => [opt.id, opt.label])),
    []
  );

  const getLatestAssessmentForPatient = (patientId: string) => {
    const patientAssessments = assessments.filter(
      (assessment) => assessment.patientId === patientId
    );
    if (patientAssessments.length === 0) return null;
    return patientAssessments.sort(
      (a, b) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    )[0];
  };

  return (
    <div className="space-y-4">
      {patients.map((patient) => {
        const assessment = getLatestAssessmentForPatient(patient._id!);
        const patientId = patient._id!;

        return (
          <div
            key={patientId}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">
                  {patient.fullName}
                </h4>
                <p className="text-sm text-gray-600">
                  Age: {patient.age} • Gender: {patient.gender}
                </p>
              </div>
              {/* BUTTONS CONTAINER */}
              <div className="flex space-x-2">
                {/* View Details Button (Always present, navigates to original form) */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPatientClick(patientId)}
                >
                  <Eye className="w-4 h-4 mr-2" /> View Details
                </Button>

                {/* View Report Button (Only present if an assessment exists) */}
                {assessment && onViewReportClick && (
                  <Button
                    variant="default" // Use default for better visibility
                    size="sm"
                    onClick={() => onViewReportClick(patientId)}
                  >
                    <ClipboardList className="w-4 h-4 mr-2" /> View Report
                  </Button>
                )}
              </div>
            </div>
            {assessment && (
              <div className="mt-4 pt-4 border-t bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-green-800 flex items-center">
                    <MessageCircle className="w-5 h-5 text-green-600 mr-2" />
                    Latest Doctor's Response
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(assessment.createdAt!).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-1">
                      Medical Diagnosis
                    </h5>
                    <p className="text-gray-700 bg-white p-2 rounded border border-green-200">
                      {assessment.medicalDiagnosis}
                    </p>
                  </div>
                  {assessment.recommendedTreatments &&
                    assessment.recommendedTreatments.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-1">
                          Recommended Treatments
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {assessment.recommendedTreatments.map(
                            (treatmentId) => (
                              <Badge
                                key={treatmentId}
                                variant="secondary"
                                className="bg-green-100 text-green-800"
                              >
                                {treatmentLabels.get(treatmentId) ||
                                  treatmentId.replace(/_/g, " ")}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  {assessment.additionalNotes && (
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-1">
                        Additional Notes
                      </h5>
                      <p className="text-gray-700 bg-white p-2 rounded border border-green-200">
                        {assessment.additionalNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function AssistantDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const { data: patients = [], isLoading: patientsLoading } = useQuery<
    Patient[]
  >({ queryKey: ["/api/patients"] });
  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery<
    Assessment[]
  >({ queryKey: ["/api/assessments"] });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Notification for new assessments with sound queue (omitted for brevity)
  useEffect(() => {
    if (assessmentsLoading || patientsLoading) return;

    const seenAssessments = new Set(
      JSON.parse(localStorage.getItem("seenAssessments") || "[]")
    );
    const myPatientIds = new Set(
      patients
        .filter((p) => p.submittedByAssistantId === user?._id)
        .map((p) => p._id)
    );

    const newNotifications: { assessmentId: string; patientName: string }[] =
      [];

    assessments.forEach((assessment) => {
      if (
        myPatientIds.has(assessment.patientId) &&
        !seenAssessments.has(assessment._id)
      ) {
        const patient = patients.find((p) => p._id === assessment.patientId);
        const patientName = patient ? patient.fullName : "a patient";
        newNotifications.push({ assessmentId: assessment._id!, patientName });
      }
    });

    if (newNotifications.length > 0) {
      newNotifications.forEach(({ patientName }) => {
        toast({
          title: "New Assessment Received",
          description: `A doctor has submitted an assessment for ${patientName}.`,
        });
      });

      if (notificationsEnabled && "speechSynthesis" in window) {
        const speak = (index: number) => {
          if (index >= newNotifications.length) return;
          const { patientName } = newNotifications[index];
          const utterance = new SpeechSynthesisUtterance(
            `Assessment ready for ${patientName}`
          );
          utterance.onend = () => speak(index + 1);
          window.speechSynthesis.speak(utterance);
        };
        speak(0);
      }

      newNotifications.forEach(({ assessmentId }) =>
        seenAssessments.add(assessmentId)
      );
      localStorage.setItem(
        "seenAssessments",
        JSON.stringify(Array.from(seenAssessments))
      );

      // Invalidate queries to refetch data automatically
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    }
  }, [
    assessments,
    patients,
    user,
    toast,
    assessmentsLoading,
    patientsLoading,
    notificationsEnabled,
    queryClient,
  ]);

  const myPatients = patients.filter(
    (patient) => patient.submittedByAssistantId === user?._id
  );

  const getPatientStatus = (patient: Patient) => {
    // START FIX: Use the canonical patient.status field
    switch (patient.status) {
      case "pending":
        return "Pending Review";
      case "reviewed":
        return "Report Ready";
      case "completed":
        return "Completed";
      case "report": // Assuming 'report' is similar to 'reviewed'
        return "Report Ready";
      default:
        return "Pending Review";
    }
    // END FIX
  };

  const filteredPatients = useMemo(() => {
    return myPatients.filter((patient) =>
      patient.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [myPatients, searchTerm]);

  // START FIX: Filter based on the correct patient.status
  const pending = filteredPatients.filter((p) => p.status === "pending");
  const reportReady = filteredPatients.filter(
    (p) => p.status === "reviewed" || p.status === "report"
  );
  const completed = filteredPatients.filter((p) => p.status === "completed");
  // END FIX

  const totalPages = (list: Patient[]) =>
    Math.ceil(list.length / ROWS_PER_PAGE);

  const getPaginatedData = (list: Patient[]) => {
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    return list.slice(startIndex, startIndex + ROWS_PER_PAGE);
  };

  // Define the common report navigation function
  const handleViewReport = (id: string) =>
    setLocation(`/assessment-history/${id}`);
  // Define the common patient details (form) navigation function
  const handleViewDetails = (id: string) => setLocation(`/patient/${id}`);

  return (
    <ProtectedRoute allowedRoles={["assistant"]}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user && (
          <WelcomeAnimation
            user={user}
            stats={{
              patients: myPatients.length,
              pending: pending.length,
              completed: completed.length + reportReady.length,
            }}
          />
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Assistant Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {user?.fullName}!
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => setLocation("/patient")} size="lg">
                <Plus className="w-5 h-5 mr-2" />
                New Patient Form
              </Button>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm mb-4"
            />
            <Tabs
              defaultValue="pending"
              className="w-full"
              onValueChange={() => setCurrentPage(1)}
            >
              <TabsList>
                <TabsTrigger value="pending">
                  Pending ({pending.length})
                </TabsTrigger>
                <TabsTrigger value="reportReady">
                  Report Ready ({reportReady.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completed.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="pending">
                <PatientList
                  patients={getPaginatedData(pending)}
                  onPatientClick={handleViewDetails} // View Details to form
                  // onViewReportClick is undefined for Pending
                />
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages(pending)}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((p) =>
                            Math.min(totalPages(pending), p + 1)
                          )
                        }
                        disabled={currentPage === totalPages(pending)}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </TabsContent>
              <TabsContent value="reportReady">
                <PatientList
                  patients={getPaginatedData(reportReady)}
                  onPatientClick={handleViewDetails} // View Details to form
                  onViewReportClick={handleViewReport} // View Report to assessment history
                />
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages(reportReady)}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((p) =>
                            Math.min(totalPages(reportReady), p + 1)
                          )
                        }
                        disabled={currentPage === totalPages(reportReady)}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </TabsContent>
              <TabsContent value="completed">
                <PatientList
                  patients={getPaginatedData(completed)}
                  onPatientClick={handleViewDetails} // View Details to form
                  onViewReportClick={handleViewReport} // View Report to assessment history
                />
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages(completed)}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((p) =>
                            Math.min(totalPages(completed), p + 1)
                          )
                        }
                        disabled={currentPage === totalPages(completed)}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </ProtectedRoute>
  );
}

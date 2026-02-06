import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Stethoscope,
  FileText,
  Users,
  Clock,
  CheckCircle,
  Eye,
  ClipboardList,
  UserPlus,
} from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { ProtectedRoute } from "../components/auth/ProtectedRoute.jsx";
import { WelcomeAnimation } from "../components/dashboard/WelcomeAnimation.jsx";
import type { Patient, Assessment, User } from "../../shared/schema.js";
import { AiInsightCard } from "../components/dashboard/AiInsightCard";

export default function DoctorDashboard() {
  const [, setLocation] = useLocation();
  const { user: loggedInUser } = useAuth();
  const { doctorId: viewedDoctorId } = useParams<{ doctorId?: string }>();

  // Use the ID from the URL if present (for master doctor view), otherwise use the logged-in user's ID
  const effectiveDoctorId = viewedDoctorId || loggedInUser?._id;

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: myPatients = [], isLoading: patientsLoading } = useQuery<
    Patient[]
  >({
    queryKey: ["/api/doctors", effectiveDoctorId, "patients"],
    enabled: !!effectiveDoctorId,
  });

  const { data: assessments = [] } = useQuery<Assessment[]>({
    queryKey: [`/api/assessments/doctor/${effectiveDoctorId}`],
    enabled: !!effectiveDoctorId,
  });

  // Find the doctor being viewed (could be the logged-in user or another doctor)
  const viewedDoctor = allUsers.find((u) => u._id === effectiveDoctorId);

  const myAssistants = allUsers.filter(
    (u) => u.role === "assistant" && u.assignedDoctorId === effectiveDoctorId,
  );

  const pendingPatients = myPatients.filter(
    (patient) => patient.status === "pending",
  );
  const reviewedPatients = myPatients.filter(
    (patient) => patient.status === "reviewed",
  );
  const completedPatients = myPatients.filter(
    (patient) => patient.status === "completed",
  );

  const getAssistantName = (assistantId: string) => {
    const assistant = myAssistants.find((a) => a._id === assistantId);
    return assistant?.fullName || "Unknown Assistant";
  };

  // The user to display in the welcome message is either the doctor being viewed or the logged-in user
  const displayUser = viewedDoctor || loggedInUser;
  const getLatestAssessmentForPatient = (patientId: string) => {
    const patientAssessments = assessments.filter(
      (assessment) => assessment.patientId === patientId,
    );
    return patientAssessments.sort(
      (a, b) =>
        new Date(b.createdAt || "").getTime() -
        new Date(a.createdAt || "").getTime(),
    )[0];
  };
  return (
    <ProtectedRoute allowedRoles={["doctor", "masterDoctor"]}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {displayUser && (
          <WelcomeAnimation
            user={displayUser}
            stats={{
              assistants: myAssistants.length,
              patients: myPatients.length,
              pending: pendingPatients.length,
              reviewed: reviewedPatients.length,
              completed: completedPatients.length,
            }}
          />
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Doctor Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Viewing dashboard for Dr. {displayUser?.fullName}. Review
                patient assessments and provide diagnoses.
              </p>
            </div>
            {loggedInUser?.role === "doctor" && (
              <Button onClick={() => setLocation("/user-management")} size="lg">
                <UserPlus className="w-5 h-5 mr-2" />
                Create Assistant
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {myAssistants.length}
                    </h3>
                    <p className="text-gray-600">My Assistants</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-purple-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {myPatients.length}
                    </h3>
                    <p className="text-gray-600">Total Patients</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-yellow-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {pendingPatients.length}
                    </h3>
                    <p className="text-gray-600">Pending Review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <ClipboardList className="w-8 h-8 text-blue-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {reviewedPatients.length}
                    </h3>
                    <p className="text-gray-600">Reviewed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {completedPatients.length}
                    </h3>
                    <p className="text-gray-600">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Clock className="w-6 h-6 text-yellow-600 mr-3" />
                Awaiting 1st Assessment ({pendingPatients.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patientsLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : pendingPatients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No patients are waiting for review.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPatients.map((patient) => (
                    <div
                      key={patient._id}
                      className="border rounded-lg p-4 bg-yellow-50 border-yellow-200"
                    >
                      <h4 className="font-semibold">{patient.fullName}</h4>
                      <p className="text-sm text-gray-600">
                        Assistant:{" "}
                        {getAssistantName(patient.submittedByAssistantId!)}
                      </p>
                      <Button
                        size="sm"
                        className="mt-2"
                        onClick={() => setLocation(`/doctor/${patient._id}`)}
                      >
                        <Stethoscope className="w-4 h-4 mr-2" />
                        Review & Diagnose
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <ClipboardList className="w-6 h-6 text-blue-600 mr-3" />
                Awaiting 2nd Assessment ({reviewedPatients.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patientsLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : reviewedPatients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No patients are awaiting a second opinion.
                </div>
              ) : (
                <div className="space-y-4">
                  {reviewedPatients.map((patient) => {
                    const latestAssessment = getLatestAssessmentForPatient(
                      patient._id!,
                    );
                    return (
                      <div
                        key={patient._id}
                        className="border rounded-lg p-4 bg-blue-50 border-blue-200"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">
                              {patient.fullName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Assistant:{" "}
                              {getAssistantName(
                                patient.submittedByAssistantId!,
                              )}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setLocation(`/doctor/${patient._id}`)
                            }
                          >
                            <Stethoscope className="w-4 h-4 mr-2" />
                            Assess
                          </Button>
                        </div>
                        {latestAssessment && (
                          <div className="mt-4 pt-3 border-t border-blue-200">
                            <p className="text-xs font-semibold text-gray-700">
                              Last Diagnosis:
                            </p>
                            <p className="text-sm text-gray-800 truncate">
                              {latestAssessment.medicalDiagnosis}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                Completed Cases ({completedPatients.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patientsLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : completedPatients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No cases have been completed yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {completedPatients.map((patient) => {
                    const latestAssessment = getLatestAssessmentForPatient(
                      patient._id!,
                    );
                    return (
                      <div
                        key={patient._id}
                        className="border rounded-lg p-4 bg-green-50 border-green-200"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">
                              {patient.fullName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Assistant:{" "}
                              {getAssistantName(
                                patient.submittedByAssistantId!,
                              )}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setLocation(`/assessment-history/${patient._id}`)
                            }
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            History
                          </Button>
                        </div>
                        {latestAssessment && (
                          <div className="mt-4 pt-3 border-t border-green-200">
                            <p className="text-xs font-semibold text-gray-700">
                              Final Diagnosis:
                            </p>
                            <p className="text-sm text-gray-800 truncate">
                              {latestAssessment.medicalDiagnosis}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </ProtectedRoute>
  );
}

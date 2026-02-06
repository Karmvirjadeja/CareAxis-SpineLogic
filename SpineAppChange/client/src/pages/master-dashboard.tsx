import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react"; // START FIX: Import useMemo
import {
  Users,
  Stethoscope,
  FileText,
  TrendingUp,
  Eye,
  UserCog,
  UserPlus,
} from "lucide-react";
import { Button } from "../components/ui/button.jsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { ProtectedRoute } from "../components/auth/ProtectedRoute.jsx";
import { WelcomeAnimation } from "../components/dashboard/WelcomeAnimation.jsx";
import { useLocation } from "wouter";
import type { Patient, Assessment, User } from "../../shared/schema.js";

export default function MasterDashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Get all data for system overview
  const { data: patients = [], isLoading: patientsLoading } = useQuery<
    Patient[]
  >({
    queryKey: ["/api/patients"],
  });

  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery<
    Assessment[]
  >({
    queryKey: ["/api/assessments"],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Filter users by role
  const doctors = users.filter((u) => u.role === "doctor");
  const assistants = users.filter((u) => u.role === "assistant");

  // Calculate statistics
  const totalPatients = patients.length;
  const pendingReviews = patients.filter((p) => p.status === "pending").length;
  const completedAssessments = assessments.length;

  // START FIX: Calculate statistics using useMemo for performance
  const doctorStats = useMemo(() => {
    const statsMap = new Map<
      string,
      {
        assistants: number;
        patients: number;
        assessments: number;
        pending: number;
      }
    >();

    // Pre-process assistants by their doctor
    const assistantsByDoctor = new Map<string, User[]>();
    assistants.forEach((a) => {
      if (!a.assignedDoctorId) return;
      const list = assistantsByDoctor.get(a.assignedDoctorId) || [];
      list.push(a);
      assistantsByDoctor.set(a.assignedDoctorId, list);
    });

    // Pre-process patients by their assistant
    const patientsByAssistant = new Map<string, Patient[]>();
    patients.forEach((p) => {
      if (!p.submittedByAssistantId) return;
      const list = patientsByAssistant.get(p.submittedByAssistantId) || [];
      list.push(p);
      patientsByAssistant.set(p.submittedByAssistantId, list);
    });

    // Pre-process assessments by their doctor
    const assessmentsByDoctor = new Map<string, Assessment[]>();
    assessments.forEach((a) => {
      if (!a.doctorId) return;
      const list = assessmentsByDoctor.get(a.doctorId) || [];
      list.push(a);
      assessmentsByDoctor.set(a.doctorId, list);
    });

    // Calculate stats for each doctor
    doctors.forEach((doctor) => {
      const doctorId = doctor._id!;
      const assignedAssistants = assistantsByDoctor.get(doctorId) || [];

      const doctorPatients = assignedAssistants.flatMap(
        (a) => patientsByAssistant.get(a._id!) || []
      );
      const doctorAssessments = assessmentsByDoctor.get(doctorId) || [];

      // Use the correct 'patient.status' field for pending counts
      const pending = doctorPatients.filter(
        (p) => p.status === "pending"
      ).length;

      statsMap.set(doctorId, {
        assistants: assignedAssistants.length,
        patients: doctorPatients.length,
        assessments: doctorAssessments.length,
        pending: pending,
      });
    });
    return statsMap;
  }, [doctors, assistants, patients, assessments]);
  // END FIX

  return (
    <ProtectedRoute allowedRoles={["masterDoctor"]}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Animation */}
        {user && (
          <WelcomeAnimation
            user={user}
            stats={{
              doctors: doctors.length,
              assistants: assistants.length,
              patients: totalPatients,
              assessments: completedAssessments,
            }}
          />
        )}

        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Master Doctor Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome, Dr. {user?.fullName}! System overview and management
                control.
              </p>
            </div>
            <Button onClick={() => setLocation("/user-management")} size="lg">
              <UserPlus className="w-5 h-5 mr-2" />
              Create User
            </Button>
          </div>

          {/* System Statistics */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-purple-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {doctors.length}
                    </h3>
                    <p className="text-gray-600">Doctors</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <UserCog className="w-8 h-8 text-blue-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {assistants.length}
                    </h3>
                    <p className="text-gray-600">Assistants</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-green-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {totalPatients}
                    </h3>
                    <p className="text-gray-600">Total Patients</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-orange-600 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {completedAssessments}
                    </h3>
                    <p className="text-gray-600">Assessments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Doctors Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Stethoscope className="w-6 h-6 text-purple-600 mr-3" />
                Doctors Overview ({doctors.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading doctors...</p>
                </div>
              ) : doctors.length === 0 ? (
                <div className="text-center py-8">
                  <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    No Doctors
                  </h3>
                  <p className="text-gray-600">
                    No doctors have been registered yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {doctors.map((doctor) => {
                    {
                      /* START FIX: Use the memoized stats map */
                    }
                    const stats = doctorStats.get(doctor._id!) || {
                      assistants: 0,
                      patients: 0,
                      assessments: 0,
                      pending: 0,
                    };
                    {
                      /* END FIX */
                    }

                    return (
                      <div
                        key={doctor._id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() =>
                          setLocation(`/doctor/view/${doctor._id}`)
                        }
                        data-testid={`doctor-overview-${doctor._id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Dr. {doctor.fullName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {doctor.email}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{stats.assistants} assistants</span>
                              <span>{stats.patients} patients</span>
                              <span>{stats.assessments} completed</span>
                              <span>{stats.pending} pending</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge
                              className={
                                stats.pending > 0
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }
                            >
                              {stats.pending > 0
                                ? `${stats.pending} pending`
                                : "Up to date"}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`button-view-doctor-${doctor._id}`}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Dashboard
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assistants Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <UserCog className="w-6 h-6 text-blue-600 mr-3" />
                Assistants Overview ({assistants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assistants.length === 0 ? (
                <div className="text-center py-8">
                  <UserCog className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">
                    No Assistants
                  </h3>
                  <p className="text-gray-600">
                    No assistants have been registered yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assistants.map((assistant) => {
                    const assistantPatients = patients.filter(
                      (p) => p.submittedByAssistantId === assistant._id
                    );
                    const assignedDoctor = doctors.find(
                      (d) => d._id === assistant.assignedDoctorId
                    );

                    return (
                      <div
                        key={assistant._id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {assistant.fullName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {assistant.email}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Assigned to: Dr.{" "}
                              {assignedDoctor?.fullName || "Unassigned"} •
                              {assistantPatients.length} patients submitted
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-blue-100 text-blue-800">
                              {assistantPatients.length} patients
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <TrendingUp className="w-6 h-6 text-orange-600 mr-3" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patientsLoading || assessmentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading activity...</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {/* Recent Patients */}
                {patients
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt || "").getTime() -
                      new Date(a.createdAt || "").getTime()
                  )
                  .slice(0, 10)
                  .map((patient) => {
                    const assistant = assistants.find(
                      (a) => a._id === patient.submittedByAssistantId
                    );
                    const hasAssessment = assessments.some(
                      (a) => a.patientId === patient._id
                    );

                    return (
                      <div
                        key={patient._id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {patient.fullName}
                            </h5>
                            <p className="text-xs text-gray-500">
                              By {assistant?.fullName || "Unknown"} •{" "}
                              {new Date(
                                patient.createdAt || ""
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={
                            hasAssessment
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {hasAssessment ? "Completed" : "Pending"}
                        </Badge>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </ProtectedRoute>
  );
}

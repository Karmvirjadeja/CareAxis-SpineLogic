import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  User,
  Calendar,
  FileText,
  ClipboardList,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../context/AuthContext";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import type { Patient, Assessment } from "@shared/schema";

export default function AssessmentHistory() {
  const [, setLocation] = useLocation();
  const { patientId } = useParams<{ patientId: string }>();

  const { data: patient, isLoading: patientLoading } = useQuery<Patient>({
    queryKey: ["/api/patients", patientId],
    enabled: !!patientId,
  });

  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery<
    Assessment[]
  >({
    queryKey: ["/api/assessments", "patient", patientId],
    enabled: !!patientId,
  });

  const sortedAssessments = assessments.sort(
    (a, b) =>
      new Date(b.createdAt || "").getTime() -
      new Date(a.createdAt || "").getTime()
  );

  if (patientLoading || assessmentsLoading) {
    return (
      <ProtectedRoute allowedRoles={["assistant", "doctor", "masterDoctor"]}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading assessment history...</p>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (!patient) {
    return (
      <ProtectedRoute allowedRoles={["assistant", "doctor", "masterDoctor"]}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Patient Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              The patient you're looking for doesn't exist.
            </p>
            <Button onClick={() => setLocation("/assistant")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["assistant", "doctor", "masterDoctor"]}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Assessment History
            </h1>
            <p className="text-gray-600 mt-2">
              Review all doctor assessments for {patient.fullName}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span> {patient.fullName}
              </div>
              <div>
                <span className="font-medium">Age:</span> {patient.age} years
              </div>
              <div>
                <span className="font-medium">Gender:</span> {patient.gender}
              </div>
              <div>
                <span className="font-medium">Pain Level:</span>{" "}
                {patient.painLevel || "N/A"}/10
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="w-5 h-5 mr-2" />
              Doctor Assessments ({sortedAssessments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedAssessments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Assessments Yet
                </h3>
                <p className="text-gray-600">
                  This patient hasn't received any doctor assessments yet.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedAssessments.map((assessment, index) => (
                  <div
                    key={assessment._id}
                    className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="bg-white">
                          Assessment #{sortedAssessments.length - index}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(
                            assessment.createdAt || ""
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                      {index === 0 && (
                        <Badge className="bg-green-100 text-green-800">
                          Latest Assessment
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Medical Diagnosis
                        </h4>
                        <div className="bg-white p-4 rounded-md border text-gray-700">
                          {assessment.medicalDiagnosis ||
                            "No diagnosis provided"}
                        </div>
                      </div>
                      {assessment.recommendedTreatments &&
                        assessment.recommendedTreatments.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Recommended Treatments
                            </h4>
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
                      {assessment.additionalNotes && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">
                            Additional Notes
                          </h4>
                          <div className="bg-white p-4 rounded-md border text-gray-700">
                            {assessment.additionalNotes}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </ProtectedRoute>
  );
}

import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext.jsx";
import {
  User,
  UserCheck,
  Stethoscope,
  FileText,
  LogIn,
  Settings,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect authenticated users to their role-specific dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      switch (user.role) {
        case "assistant":
          setLocation("/assistant");
          break;
        case "doctor":
          setLocation("/doctor");
          break;
        case "masterDoctor":
          setLocation("/master");
          break;
      }
    }
  }, [user, isAuthenticated, isLoading, setLocation]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Authentication Required Section */}
        <div className="mb-8">
          <div className="medical-card">
            <div className="text-center mb-8">
              <LogIn className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to CareAxis
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                A comprehensive spine health assessment and management platform
                with role-based access for healthcare professionals.
              </p>
              <Button
                onClick={() => setLocation("/login")}
                size="lg"
                className="px-8 py-3"
                data-testid="button-go-to-login"
              >
                <LogIn className="w-5 h-5 mr-2" />
                Login to Continue
              </Button>
            </div>
          </div>
        </div>

        {/* Role Information */}
        <div className="mb-8">
          <div className="medical-card">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              User Roles & Access Levels
            </h3>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="text-white w-8 h-8" />
                </div>
                <h4 className="text-xl font-semibold text-blue-600 mb-2">
                  Assistant
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Submit patient forms and track doctor responses for assigned
                  patients.
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Fill patient assessment forms</li>
                  <li>• View doctor responses</li>
                  <li>• Track patient status</li>
                </ul>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="text-white w-8 h-8" />
                </div>
                <h4 className="text-xl font-semibold text-green-600 mb-2">
                  Doctor
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Review patient assessments and provide diagnoses for assigned
                  assistants.
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Review patient assessments</li>
                  <li>• Provide diagnoses</li>
                  <li>• Send responses to assistants</li>
                </ul>
              </div>

              <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="text-white w-8 h-8" />
                </div>
                <h4 className="text-xl font-semibold text-purple-600 mb-2">
                  Master Doctor
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Overview of all doctors, assistants, and patient management
                  system.
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• View all doctors and assistants</li>
                  <li>• Monitor patient flow</li>
                  <li>• System administration</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="medical-card">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            Platform Features
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto text-center mb-8">
            Advanced CareAxis with role-based access control and comprehensive
            patient assessment tools.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">3D</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">
                3D Body Mapping
              </h4>
              <p className="text-sm text-gray-600">
                Interactive body visualization for precise pain location
                tracking
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Stethoscope className="text-green-500 w-6 h-6" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">
                Medical Diagnosis
              </h4>
              <p className="text-sm text-gray-600">
                Professional diagnosis and treatment planning
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="text-purple-500 w-6 h-6" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">
                Comprehensive Reports
              </h4>
              <p className="text-sm text-gray-600">
                Detailed medical reports with treatment recommendations
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // This should not be reached due to the useEffect redirect, but just in case
  return null;
}

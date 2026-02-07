// client/src/App.tsx

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient.js";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster.jsx";
import { TooltipProvider } from "./components/ui/tooltip.jsx";
import { Header } from "./components/layout/header.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import Home from "./pages/home.jsx";
import LoginPage from "./pages/login.jsx";
import PatientForm from "./pages/patient-form.jsx";
import DoctorForm from "./pages/doctor-form.jsx";
import ComprehensiveDoctorView from "./pages/comprehensive-doctor-view.jsx";
import DoctorOverview from "./pages/doctor-overview.jsx";
import AdminSettings from "./pages/admin-settings.jsx";
import AssistantDashboard from "./pages/assistant-dashboard.jsx";
import DoctorDashboard from "./pages/doctor-dashboard.jsx";
import MasterDashboard from "./pages/master-dashboard.jsx";
import UserManagement from "./pages/user-management.jsx";
import AssessmentHistory from "./pages/assessment-history.jsx";
import NotFound from "@/pages/not-found.jsx";
import { BodyMapSelector } from "./components/ui/BodyMapSelector.js";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={LoginPage} />

      {/* Role-based dashboard routes */}
      <Route path="/assistant" component={AssistantDashboard} />
      <Route path="/doctor" component={DoctorDashboard} />
      {/* This new route allows viewing a specific doctor's dashboard */}
      <Route path="/doctor/view/:doctorId" component={DoctorDashboard} />
      <Route path="/master" component={MasterDashboard} />

      {/* Specific task routes */}
      <Route path="/doctor/:patientId" component={ComprehensiveDoctorView} />
      <Route path="/doctor-overview/:doctorId" component={DoctorOverview} />
      <Route path="/patient/:patientId?" component={PatientForm} />
      <Route
        path="/assessment-history/:patientId"
        component={AssessmentHistory}
      />
      <Route path="/admin" component={AdminSettings} />
      <Route path="/user-management" component={UserManagement} />

      {/* Legacy routes for backwards compatibility */}
      <Route path="/patient" component={PatientForm} />
      <Route path="/BodyMapSelector" component={BodyMapSelector} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-slate-50">
            <Header />
            <Router />
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

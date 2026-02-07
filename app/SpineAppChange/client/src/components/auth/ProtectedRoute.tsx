import { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLocation } from "wouter";
import { Card, CardContent } from "../../components/ui/card.jsx";
import { Button } from "../../components/ui/button.jsx";
import { LogIn, Lock } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles = [],
  requireAuth = true,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <LogIn className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to access this page.
            </p>
            <Button
              onClick={() => setLocation("/login")}
              className="w-full"
              data-testid="button-go-to-login"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check role permissions if roles are specified
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Lock className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Your role: <span className="font-medium">{user.role}</span>
              <br />
              Required:{" "}
              <span className="font-medium">{allowedRoles.join(", ")}</span>
            </p>
            <div className="space-y-2">
              <Button
                onClick={() => setLocation("/")}
                className="w-full"
                data-testid="button-go-home"
              >
                Go to Home
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation(getRoleBasedRoute(user.role))}
                className="w-full"
                data-testid="button-go-to-dashboard"
              >
                Go to My Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is authenticated and has proper permissions
  return <>{children}</>;
}

// Helper function to get role-based route
function getRoleBasedRoute(role: string): string {
  switch (role) {
    case "assistant":
      return "/assistant";
    case "doctor":
      return "/doctor";
    case "masterDoctor":
      return "/master";
    default:
      return "/";
  }
}

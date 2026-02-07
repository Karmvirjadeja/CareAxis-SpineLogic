import { Stethoscope, LogOut, User } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button } from "../../components/ui/button.jsx";
import { useToast } from "../../hooks/use-toast.js";
import NotificationSheet from "../ui/NotificationSheet.jsx";

export function Header() {
  const [, setLocation] = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "assistant":
        return "Assistant";
      case "doctor":
        return "Doctor";
      case "masterDoctor":
        return "Master Doctor";
      default:
        return role;
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setLocation("/")}
            data-testid="header-logo"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Stethoscope className="text-white w-4 h-4" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">CareAxis</h1>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated && user && (
              <>
                {/* --- NEW NOTIFICATION BELL --- */}
                <NotificationSheet />
                {/* --- END NEW NOTIFICATION BELL --- */}

                <div className="flex items-center text-sm text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span className="font-medium hidden sm:inline">
                    {user.fullName}
                  </span>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  data-testid="button-logout"
                  className="touch-target"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            )}

            {!isAuthenticated && (
              <Button
                onClick={() => setLocation("/login")}
                data-testid="button-login-header"
                className="touch-target"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

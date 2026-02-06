// client/src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiRequest } from "../lib/queryClient.js";
import { User } from "../../shared/schema.js";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
    const interval = setInterval(() => {
      const token = localStorage.getItem("authToken");
      if (token) {
        console.log("Refreshing auth token...");
        apiRequest("GET", "/api/auth/me").catch((error) => {
          console.error("Token refresh failed, logging out:", error);
          logout();
        });
      }
    }, 10 * 60 * 1000);
    const handleForceLogout = () => {
      console.warn("Forced logout due to 401 API error.");
      logout();
    };
    window.addEventListener("forceLogout", handleForceLogout);
    return () => {
      clearInterval(interval);
      window.removeEventListener("forceLogout", handleForceLogout);
    };
  }, []);

  useEffect(() => {
    checkAuthStatus();
    const interval = setInterval(() => {
      const token = localStorage.getItem("authToken");
      if (token) {
        console.log("Refreshing session...");
        apiRequest("GET", "/api/auth/me").catch((err) =>
          console.warn("Token refresh warning:", err)
        );
      }
    }, 10 * 60 * 1000);
    const handleForceLogout = () => {
      console.error("Critical session failure. Logging out.");
      logout();
    };
    window.addEventListener("forceLogout", handleForceLogout);

    return () => {
      clearInterval(interval);
      window.removeEventListener("forceLogout", handleForceLogout);
    };
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await apiRequest("GET", "/api/auth/me");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem("authToken");
      }
    } catch (error) {
      console.log("Not authenticated");
      localStorage.removeItem("authToken");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    const response = await apiRequest("POST", "/api/auth/login", {
      email,
      password,
    });
    const result = await response.json();
    if (result.token) {
      localStorage.setItem("authToken", result.token);
      setUser(result.user);
      return result.user;
    } else {
      throw new Error("Login failed: no token received.");
    }
  };

  const logout = (): void => {
    localStorage.removeItem("authToken");
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

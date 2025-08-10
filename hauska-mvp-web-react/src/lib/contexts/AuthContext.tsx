import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authApi from "../../api/auth";
import { UserProfile } from "../../api/types/auth.types";
import { trackAuth } from "../analytics";
import { toast } from "sonner";

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  loadUserProfile: () => Promise<void>;
  checkTokenValidity: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we were auto-logged out
    const autoLogout = sessionStorage.getItem("autoLogout");
    if (autoLogout === "true") {
      toast.error("Your session has expired. Please login again.");
      sessionStorage.removeItem("autoLogout");
    }

    const token = localStorage.getItem("token");
    if (token) {
      // Instead of immediately trying to load the profile, first check if the token is valid
      checkTokenValidity().then((isValid) => {
        if (isValid) {
          loadUserProfile();
        } else {
          // If token is not valid, clear it and update loading state
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);

          // Redirect to login if not already on an auth page
          const isAuthPage = ["/login", "/register", "/forgot-password"].some(
            (path) => location.pathname.startsWith(path)
          );

          if (!isAuthPage) {
            toast.error("Your session has expired. Please login again.");

            setTimeout(() => {
              navigate("/login");
            }, 1500);
          }
        }
      });
    } else {
      setLoading(false);
    }
  }, []);

  // When location changes and we're on a protected route, validate token again
  useEffect(() => {
    // Skip token validation on auth pages
    const isAuthPage = ["/login", "/register", "/forgot-password"].some(
      (path) => location.pathname.startsWith(path)
    );

    if (isAuthenticated && !isAuthPage && localStorage.getItem("token")) {
      checkTokenValidity();
    }
  }, [location.pathname]);

  const checkTokenValidity = async (): Promise<boolean> => {
    try {
      const isValid = await authApi.validateToken();
      if (!isValid) {
        // If token is invalid, clear everything
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);

        // Only redirect if we're not already on an auth page
        const isAuthPage = ["/login", "/register", "/forgot-password"].some(
          (path) => location.pathname.startsWith(path)
        );

        if (!isAuthPage) {
          toast.error("Your session has expired. Please login again.");
          setTimeout(() => {
            navigate("/login");
          }, 1500);
        }
      }
      return isValid;
    } catch (error) {
      // On error, assume token is invalid
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  };

  const loadUserProfile = async () => {
    try {
      const response = await authApi.getProfile();

      // Check if response contains an error status despite 200 OK HTTP status
      if (response.status === "error") {
        // Check if error is related to expired/invalid token
        if (
          response.message &&
          (response.message.toLowerCase().includes("token is expired") ||
            response.message.toLowerCase().includes("authentication failed") ||
            response.message.toLowerCase().includes("invalid token"))
        ) {
          // Handle token expiration
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setUser(null);

          // Only show error and redirect if we're not already on an auth page
          const isAuthPage = ["/login", "/register", "/forgot-password"].some(
            (path) => location.pathname.startsWith(path)
          );

          if (!isAuthPage) {
            toast.error("Your session has expired. Please login again.");

            setTimeout(() => {}, 1500);
          }

          setLoading(false);
          return;
        }
      }

      // If response is valid, set the user data
      setUser(response.data);
      setIsAuthenticated(true);
      trackAuth.profileView();
    } catch (error: any) {
      // If the error is due to an expired token, log the user out
      if (
        error.response?.status === 401 ||
        error.response?.data?.message
          ?.toLowerCase()
          .includes("token is expired")
      ) {
        // Just clear everything and redirect to login
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);

        // Only show error and redirect if we're not already on an auth page
        const isAuthPage = ["/login", "/register", "/forgot-password"].some(
          (path) => location.pathname.startsWith(path)
        );

        if (!isAuthPage) {
          toast.error("Your session has expired. Please login again.");
          setTimeout(() => {
            navigate("/login");
          }, 1500);
        }
      } else {
        // For other errors, just clear the session
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Clear any existing auth data before trying to log in
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setUser(null);

      const response = await authApi.login({ email, password });

      if (response.status === "error") {
        throw new Error(response.message || "Login failed");
      }

      localStorage.setItem("token", response.data.token);
      trackAuth.login();
      await loadUserProfile();
      navigate("/");
    } catch (error: any) {
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const response = await authApi.register(data);

      if (response.status === "error") {
        throw new Error(response.message || "Registration failed");
      }

      trackAuth.register();
      navigate("/login");
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setUser(null);
      trackAuth.logout();
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        register,
        logout,
        loading,
        loadUserProfile,
        checkTokenValidity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

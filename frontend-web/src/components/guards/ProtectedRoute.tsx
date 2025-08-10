import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!loading && !hasChecked) {
      setHasChecked(true);

      if (!localStorage.getItem("token")) {
        navigate("/login", { replace: true });
        return;
      }

      if (!isAuthenticated) {
        toast.error("Your session has expired. Please login again.");
        navigate("/login", { replace: true });
        return;
      }

      if (isAuthenticated && user && !user.is_verified) {
        toast.warning("Please verify your email address to continue.");
        navigate("/verify-email", { replace: true });
        return;
      }
    }
  }, [isAuthenticated, user, loading, navigate, hasChecked]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !user.is_verified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <>{children}</>;
};

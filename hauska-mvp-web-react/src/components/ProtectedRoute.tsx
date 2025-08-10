import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, checkTokenValidity } = useAuth();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (isAuthenticated) {
        const valid = await checkTokenValidity();
        setIsValid(valid);
      } else {
        setIsValid(false);
      }
      setIsValidating(false);
    };

    validateToken();
  }, [isAuthenticated, checkTokenValidity, location.pathname]);

  if (loading || isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isValid) {
    // Redirect to login if not authenticated or token is invalid
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

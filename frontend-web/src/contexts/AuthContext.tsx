import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import type { AuthUser } from "../api/types/auth.types";
import { useProfile, useValidateToken, useLogout } from "../hooks/useAuth";

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  setAuthenticated: (value: boolean) => void;
  logout: () => void;
  checkTokenValidity: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const isCheckingRef = useRef(false);

  const { refetch: refetchTokenValidity } = useValidateToken();
  const { mutate: logoutMutation } = useLogout();

  const {
    data: profileData,
    isError: profileError,
    refetch: refetchProfile,
  } = useProfile();

  useEffect(() => {
    const handleTokenChange = () => {
      const token = localStorage.getItem("token");
      if (token && !isCheckingRef.current) {
        checkTokenValidity();
      } else if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
      }
    };

    handleTokenChange();

    window.addEventListener("storage", handleTokenChange);
    return () => window.removeEventListener("storage", handleTokenChange);
  }, []);

  useEffect(() => {
    if (profileData?.status === "success") {
      const userData: AuthUser = {
        id: profileData.data.user.id,
        email: profileData.data.user.email,
        first_name: profileData.data.profile.first_name,
        last_name: profileData.data.profile.last_name,
        is_mfa_enabled: profileData.data.user.is_mfa_enabled,
        is_verified: profileData.data.user.is_verified,
        role: {
          id: profileData.data.role.id,
          name: profileData.data.role.name,
        },
        limit: {
          limit: profileData.data.limit.limit,
          used: profileData.data.limit.used,
        },
      };

      setUser(userData);
      setIsAuthenticated(true);
      setLoading(false);
      isCheckingRef.current = false;
    } else if (profileError) {
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      isCheckingRef.current = false;
    }
  }, [profileData, profileError]);

  const checkTokenValidity = async () => {
    if (isCheckingRef.current) {
      return isAuthenticated;
    }

    isCheckingRef.current = true;

    try {
      const result = await refetchTokenValidity();
      const isValid = result.data === true;

      if (isValid) {
        await refetchProfile();
        setIsAuthenticated(true);
      } else {
        handleInvalidToken();
      }

      return isValid;
    } catch (error) {
      handleInvalidToken();
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleInvalidToken = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    setUser(null);
    setLoading(false);
    isCheckingRef.current = false;
  };

  const logout = () => {
    logoutMutation(undefined, {
      onSuccess: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        setIsAuthenticated(false);
        setUser(null);
        navigate("/login", { replace: true });
      },
      onError: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        setIsAuthenticated(false);
        setUser(null);
        navigate("/login", { replace: true });
      },
    });
  };

  const setAuthenticated = (value: boolean) => {
    setIsAuthenticated(value);
    if (value && !isCheckingRef.current) {
      refetchProfile();
    }
  };

  const refreshUser = async () => {
    await refetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        setUser,
        setAuthenticated,
        logout,
        checkTokenValidity,
        refreshUser,
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

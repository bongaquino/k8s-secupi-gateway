import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  login,
  register,
  verifyOTP,
  forgotPassword,
  resetPassword,
  verifyAccount,
  resendVerificationCode,
  getProfile,
  refreshToken,
  revokeToken,
  validateToken,
  generateOTP,
  enableMFA,
  disableMFA,
  changePassword,
  logout,
} from "../api/services/auth";
import type {
  LoginData,
  RegisterData,
  VerifyOTPData,
  ForgotPasswordData,
  ResetPasswordData,
  VerifyAccountData,
  EnableMFAData,
  DisableMFAData,
  ChangePasswordData,
  RefreshTokenData,
  RevokeTokenData,
} from "../api/types/auth.types";

const AUTH_KEYS = {
  all: ["auth"] as const,
  profile: () => [...AUTH_KEYS.all, "profile"] as const,
  tokenValidity: () => [...AUTH_KEYS.all, "tokenValidity"] as const,
  mfaOTP: () => [...AUTH_KEYS.all, "mfaOTP"] as const,
};

export const useValidateToken = () => {
  return useQuery({
    queryKey: AUTH_KEYS.tokenValidity(),
    queryFn: () => validateToken(),
    refetchOnWindowFocus: false,
    enabled: !!localStorage.getItem("token"),
    placeholderData: (prev) => prev,
  });
};

export const useProfile = () => {
  return useQuery({
    queryKey: AUTH_KEYS.profile(),
    queryFn: () => getProfile(),
    enabled: !!localStorage.getItem("token"),
    refetchOnWindowFocus: false,
  });
};

export const useGenerateOTP = () => {
  return useQuery({
    queryKey: AUTH_KEYS.mfaOTP(),
    queryFn: () => generateOTP(),
    enabled: false,
    refetchOnWindowFocus: false,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginData) => login(credentials),
    onSuccess: (response) => {
      if (response.status === "success" && response.data?.access_token) {
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("refreshToken", response.data.refresh_token);

        queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile() });
        queryClient.invalidateQueries({ queryKey: AUTH_KEYS.tokenValidity() });
      }
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterData) => register(data),
    onSuccess: (response) => {
      if (
        response.status === "success" &&
        response.data?.tokens?.access_token
      ) {
        localStorage.setItem("token", response.data.tokens.access_token);
        localStorage.setItem(
          "refreshToken",
          response.data.tokens.refresh_token
        );

        queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile() });
        queryClient.invalidateQueries({ queryKey: AUTH_KEYS.tokenValidity() });
      }
    },
  });
};

export const useVerifyOTP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyOTPData) => verifyOTP(data),
    onSuccess: (response) => {
      if (response.status === "success" && response.data?.access_token) {
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("refreshToken", response.data.refresh_token);

        queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile() });
        queryClient.invalidateQueries({ queryKey: AUTH_KEYS.tokenValidity() });
      }
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordData) => forgotPassword(data),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordData) => resetPassword(data),
  });
};

export const useVerifyAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyAccountData) => verifyAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile() });
    },
  });
};

export const useResendVerificationCode = () => {
  return useMutation({
    mutationFn: () => resendVerificationCode(),
  });
};

export const useRefreshToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RefreshTokenData) => refreshToken(data),
    onSuccess: (response) => {
      if (response.status === "success" && response.data?.access_token) {
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("refreshToken", response.data.refresh_token);

        queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile() });
        queryClient.invalidateQueries({ queryKey: AUTH_KEYS.tokenValidity() });
      }
    },
  });
};

export const useRevokeToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RevokeTokenData) => revokeToken(data),
    onSuccess: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      queryClient.clear();
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useEnableMFA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EnableMFAData) => enableMFA(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile() });
    },
  });
};

export const useDisableMFA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DisableMFAData) => disableMFA(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile() });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordData) => changePassword(data),
  });
};

export { AUTH_KEYS };

import api from "../client";
import type {
  RegisterData,
  RegisterResponse,
  LoginData,
  VerifyOTPData,
  VerifyOTPResponse,
  ForgotPasswordData,
  ForgotPasswordResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  VerifyAccountData,
  VerifyAccountResponse,
  ResendVerificationResponse,
  ProfileResponse,
  RefreshTokenData,
  RefreshTokenResponse,
  RevokeTokenData,
  RevokeTokenResponse,
  GenerateOTPResponse,
  EnableMFAData,
  EnableMFAResponse,
  DisableMFAData,
  DisableMFAResponse,
  ChangePasswordData,
  ChangePasswordResponse,
} from "../types/auth.types";
import type { ApiResponse } from "../types/global.types";

export const register = async (
  data: RegisterData
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>("/users/register", data);
  return response.data;
};

export const login = async (data: LoginData): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>("/tokens/request", data);
  return response.data;
};

export const verifyOTP = async (
  data: VerifyOTPData
): Promise<VerifyOTPResponse> => {
  const response = await api.post<VerifyOTPResponse>(
    "/tokens/verify-otp",
    data
  );
  return response.data;
};

export const forgotPassword = async (
  data: ForgotPasswordData
): Promise<ForgotPasswordResponse> => {
  const response = await api.post<ForgotPasswordResponse>(
    "/users/forgot-password",
    data
  );
  return response.data;
};

export const resetPassword = async (
  data: ResetPasswordData
): Promise<ResetPasswordResponse> => {
  const response = await api.post<ResetPasswordResponse>(
    "/users/reset-password",
    data
  );
  return response.data;
};

export const verifyAccount = async (
  data: VerifyAccountData
): Promise<VerifyAccountResponse> => {
  const response = await api.post<VerifyAccountResponse>(
    "/users/verify-account",
    data
  );
  return response.data;
};

export const resendVerificationCode =
  async (): Promise<ResendVerificationResponse> => {
    const response = await api.post<ResendVerificationResponse>(
      "/users/resend-verification-code"
    );
    return response.data;
  };

export const getProfile = async (): Promise<ProfileResponse> => {
  const response = await api.get<ProfileResponse>("/profile/me");
  return response.data;
};

export const refreshToken = async (
  data: RefreshTokenData
): Promise<RefreshTokenResponse> => {
  const response = await api.post<RefreshTokenResponse>(
    "/tokens/refresh",
    data
  );
  return response.data;
};

export const revokeToken = async (
  data: RevokeTokenData
): Promise<RevokeTokenResponse> => {
  const response = await api.post<RevokeTokenResponse>("/tokens/revoke", data);
  return response.data;
};

export const validateToken = async (): Promise<boolean> => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return false;
    }

    await getProfile();
    return true;
  } catch (error: any) {
    return false;
  }
};

export const generateOTP = async (): Promise<GenerateOTPResponse> => {
  const response = await api.post<GenerateOTPResponse>(
    "/settings/mfa/generate-otp"
  );
  return response.data;
};

export const enableMFA = async (
  data: EnableMFAData
): Promise<EnableMFAResponse> => {
  const response = await api.post<EnableMFAResponse>(
    "/settings/mfa/enable",
    data
  );
  return response.data;
};

export const disableMFA = async (
  data: DisableMFAData
): Promise<DisableMFAResponse> => {
  const response = await api.post<DisableMFAResponse>(
    "/settings/mfa/disable",
    data
  );
  return response.data;
};

export const changePassword = async (
  data: ChangePasswordData
): Promise<ChangePasswordResponse> => {
  const response = await api.post<ChangePasswordResponse>(
    "/settings/change-password",
    data
  );
  return response.data;
};

export const logout = async (): Promise<void> => {
  const refreshToken = localStorage.getItem("refreshToken");

  try {
    if (refreshToken) {
      await revokeToken({ refresh_token: refreshToken });
    }
  } catch (error) {
    // Continue with logout even if revoke fails
    console.warn("Failed to revoke token:", error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }
};

// For backward compatibility and easier imports
export const authService = {
  register,
  login,
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
};

export default authService;

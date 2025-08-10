import type { ApiResponse } from "./global.types";

export interface RegisterData {
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  suffix?: string | null;
  email: string;
  password: string;
  confirm_password: string;
}

export interface RegisterResponse
  extends ApiResponse<{
    profile: {
      CreatedAt: string;
      FirstName: string;
      ID: string;
      LastName: string;
      MiddleName: string | null;
      Suffix: string | null;
      UpdatedAt: string;
      UserID: string;
    };
    tokens: {
      access_token: string;
      refresh_token: string;
    };
    user: {
      email: string;
    };
    user_role: {
      role_id: string;
      role_name: string;
    };
  }> {}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse
  extends ApiResponse<{
    access_token: string;
    is_mfa_enabled: boolean;
    refresh_token: string;
    login_code?: string;
  }> {}

export interface VerifyOTPData {
  login_code: string;
  otp: string;
}

export interface VerifyOTPResponse
  extends ApiResponse<{
    access_token: string;
    refresh_token: string;
  }> {}

export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordResponse extends ApiResponse<null> {}

export interface ResetPasswordData {
  email: string;
  reset_code: string;
  new_password: string;
  confirm_new_password: string;
}

export interface ResetPasswordResponse extends ApiResponse<null> {}

export interface VerifyAccountData {
  verification_code: string;
}

export interface VerifyAccountResponse extends ApiResponse<null> {}

export interface ResendVerificationResponse extends ApiResponse<null> {}

export interface ProfileResponse
  extends ApiResponse<{
    limit: {
      limit: number;
      used: number;
    };
    profile: {
      first_name: string;
      last_name: string;
    };
    role: {
      id: string;
      name: string;
    };
    user: {
      email: string;
      id: string;
      is_mfa_enabled: boolean;
      is_verified: boolean;
    };
  }> {}

export interface RefreshTokenData {
  refresh_token: string;
}

export interface RefreshTokenResponse
  extends ApiResponse<{
    access_token: string;
    refresh_token: string;
  }> {}

export interface RevokeTokenData {
  refresh_token: string;
}

export interface RevokeTokenResponse extends ApiResponse<null> {}

export interface GenerateOTPResponse
  extends ApiResponse<{
    otp_secret: string;
    qr_code: string;
  }> {}

export interface EnableMFAData {
  otp: string;
}

export interface EnableMFAResponse extends ApiResponse<null> {}

export interface DisableMFAData {
  password: string;
}

export interface DisableMFAResponse extends ApiResponse<null> {}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
}

export interface ChangePasswordResponse extends ApiResponse<null> {}

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_mfa_enabled: boolean;
  is_verified: boolean;
  role: {
    id: string;
    name: string;
  };
  limit: {
    limit: number;
    used: number;
  };
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

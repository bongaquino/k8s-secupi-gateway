export interface RegisterData {
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string | null;
  email: string;
  password: string;
  company_name?: string;
  phone_number?: string;
  industry_association?: string;
  is_student?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  data: {
    token: string;
  };
  status: string;
  message: string;
}

export interface UserProfile {
  first_name: string;
  middle_name?: string;
  last_name: string;
  suffix?: string | null;
  email: string;
  company_name?: string;
  phone_number?: string;
  industry_association?: string;
  is_student?: boolean;
}

// Response interface that can be either success or error
export interface ProfileResponse {
  status: string;
  message?: string;
  data: UserProfile | null;
  meta?: any;
}

import axios from "axios";
import {
  RegisterData,
  AuthResponse,
  LoginData,
  ProfileResponse,
} from "./types/auth.types";
import "./utils/axios-extensions";
import * as sentryUtils from "../lib/sentry";

const API_URL = import.meta.env.VITE_USER_API_BASE_URL || "";

axios.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: new Date().getTime() };

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const handleLogout = () => {
  localStorage.removeItem("token");

  sessionStorage.setItem("autoLogout", "true");
  window.location.href = "/login";
};

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    const isTokenExpired =
      error.response?.status === 401 ||
      error.response?.data?.message
        ?.toLowerCase()
        .includes("token is expired") ||
      error.response?.data?.message
        ?.toLowerCase()
        .includes("authentication failed") ||
      error.response?.data?.message?.toLowerCase().includes("invalid token");

    if (isTokenExpired) {
      if (!originalRequest._logout) {
        originalRequest._logout = true;
        handleLogout();
      }
    }

    return Promise.reject(error);
  }
);

const authApi = {
  register: async (data: RegisterData) => {
    // Add breadcrumb for debugging
    sentryUtils.addBreadcrumb({
      category: "auth",
      message: "User registration",
      level: "info",
      data: { email: data.email },
    });

    return sentryUtils.withMonitoring(
      "auth.register",
      async () => {
        const response = await axios.post<AuthResponse>(
          `${API_URL}/users/register`,
          data
        );
        return response.data;
      },
      { email: data.email }
    );
  },

  login: async (data: LoginData) => {
    sessionStorage.removeItem("autoLogout");

    // Add breadcrumb for debugging
    sentryUtils.addBreadcrumb({
      category: "auth",
      message: "User login attempt",
      level: "info",
      data: { email: data.email },
    });

    return sentryUtils.withMonitoring(
      "auth.login",
      async () => {
        const response = await axios.post<AuthResponse>(
          `${API_URL}/tokens/request`,
          data
        );

        // Set user information in Sentry when login is successful
        if (response.data && response.data.data) {
          // We don't have user_id in the response, so we'll use email as identifier
          sentryUtils.setUser({
            email: data.email,
          });
        }

        return response.data;
      },
      { email: data.email }
    );
  },

  refreshToken: async () => {
    // Since there's no refresh token endpoint in the API,
    // we can't actually refresh the token.
    // Instead, we should log the user out and throw an error.
    localStorage.removeItem("token");
    throw new Error("Session expired");
  },

  logout: async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.delete(`${API_URL}/tokens/revoke`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } finally {
      localStorage.removeItem("token");
    }
  },

  getProfile: async () => {
    // Add breadcrumb for debugging
    sentryUtils.addBreadcrumb({
      category: "auth",
      message: "Getting user profile",
      level: "info",
    });

    return sentryUtils.withMonitoring("auth.getProfile", async () => {
      const response = await axios.get<ProfileResponse>(
        `${API_URL}/profiles/me`
      );
      return response.data;
    });
  },

  // Check if user has a valid token by trying to access a protected endpoint
  validateToken: async () => {
    try {
      // If no token exists, immediately return false
      const token = localStorage.getItem("token");
      if (!token) {
        return false;
      }

      // Use the profile endpoint to validate the token
      await axios.get(`${API_URL}/profiles/me`);
      return true;
    } catch (error: any) {
      // If we get a 401 or token expired message, the token is invalid
      if (
        error.response?.status === 401 ||
        error.response?.data?.message
          ?.toLowerCase()
          .includes("token is expired") ||
        error.response?.data?.message
          ?.toLowerCase()
          .includes("authentication failed") ||
        error.response?.data?.message?.toLowerCase().includes("invalid token")
      ) {
        // Auto logout the user
        handleLogout();
      }
      return false;
    }
  },
};

export default authApi;

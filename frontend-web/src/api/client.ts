import axios from "axios";
import { config } from "./config";

const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
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

api.interceptors.response.use(
  (response) => {
    const responseData = response.data;

    if (
      responseData?.status === "error" &&
      (responseData?.message === "Token is expired or invalid" ||
        responseData?.message === "invalid or expired access token")
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");

      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register" &&
        window.location.pathname !== "/password-reset" &&
        window.location.pathname !== "/verify-email"
      ) {
        sessionStorage.setItem(
          "tokenExpiredError",
          "Session expired. Please log in again."
        );
        window.location.href = "/login";
      }
    }

    return response;
  },
  (error) => {
    const isTokenExpired =
      error.response?.data?.message === "Token is expired or invalid" ||
      error.response?.data?.message === "invalid or expired access token";

    if (isTokenExpired) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");

      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register" &&
        window.location.pathname !== "/password-reset" &&
        window.location.pathname !== "/verify-email"
      ) {
        sessionStorage.setItem(
          "tokenExpiredError",
          "Session expired. Please log in again."
        );
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

import axios from "axios";
import config from "@/config";
import { ApiError } from "@/api/utils/apiError";

if (!config.api.internal.key) {
  throw new ApiError(
    "API key is not configured. Please set VITE_INTERNAL_API_KEY or VITE_API_KEY in your environment",
    500,
    "CONFIG_ERROR"
  );
}

// In development, use the proxy. In production, use the actual API URL
const baseURL = import.meta.env.DEV ? "" : "https://api.mnmlai.dev";

const instance = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${config.api.internal.key}`,
  },
  withCredentials: false,
  maxContentLength: config.upload.maxFileSize,
  maxBodyLength: config.upload.maxFileSize,
});

// Add request interceptor
instance.interceptors.request.use(
  (config) => {
    // Don't set Content-Type for FormData - axios will set it automatically with boundary
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const internalApi = instance;
export const externalApi = instance;

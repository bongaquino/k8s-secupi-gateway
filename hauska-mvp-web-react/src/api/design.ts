import axios from "axios";
import {
  DesignOptions,
  DesignStatusResponse,
  DesignSubmitResponse,
} from "./types/design.types";
import "./utils/axios-extensions";
import config from "@/config";
import { ApiError } from "./utils/apiError";
import { trackDesign } from "../lib/analytics";
import * as sentryUtils from "../lib/sentry";

// Define the API routes
const DESIGN_ROUTES = {
  submit: (designType: "interior" | "exterior") => `/v1/${designType}`,
  status: (requestId: string) => `/v1/status/${requestId}`,
  viewImage: (url: string) => `/v1/view-image?url=${encodeURIComponent(url)}`,
};

// Create Axios instance with appropriate configs
const baseURL = import.meta.env.DEV ? "" : "https://api.mnmlai.dev";

const designApi = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
    Authorization: `Bearer ${config.api.internal.key}`,
  },
  withCredentials: false,
  maxContentLength: config.upload.maxFileSize,
  maxBodyLength: config.upload.maxFileSize,
});

// Add request interceptor for FormData
designApi.interceptors.request.use(
  (config) => {
    // Add metadata for timing
    config.metadata = { startTime: new Date().getTime() };

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

// Add response interceptor
designApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Private validation functions
const validateFileSize = (file: File) => {
  if (file.size > config.upload.maxFileSize) {
    throw ApiError.badRequest(
      `File size exceeds the limit of ${
        config.upload.maxFileSize / (1024 * 1024)
      }MB`,
      "FILE_TOO_LARGE"
    );
  }
};

const validateFileType = (file: File) => {
  if (!config.upload.allowedMimeTypes.includes(file.type)) {
    throw ApiError.badRequest(
      `File type ${
        file.type
      } is not supported. Allowed types: ${config.upload.allowedMimeTypes.join(
        ", "
      )}`,
      "INVALID_FILE_TYPE"
    );
  }
};

const validateDesignRequest = (
  image: File | undefined,
  prompt: string | undefined,
  designType: "interior" | "exterior" | undefined
) => {
  if (!image) {
    throw ApiError.badRequest("Image is required", "MISSING_IMAGE");
  }

  if (!prompt) {
    throw ApiError.badRequest("Prompt is required", "MISSING_PROMPT");
  }

  if (!designType) {
    throw ApiError.badRequest("Design type is required", "MISSING_DESIGN_TYPE");
  }

  validateFileSize(image);
  validateFileType(image);
};

// Exported design APIs
const designService = {
  /**
   * Submit a design request and get a request ID
   */
  submitDesignRequest: async (
    file: File,
    prompt: string,
    options: DesignOptions
  ): Promise<DesignSubmitResponse> => {
    // Add breadcrumb for debugging
    sentryUtils.addBreadcrumb({
      category: "design",
      message: "Submitting design request",
      level: "info",
      data: {
        designType: options.designType,
        fileSize: file.size,
        promptLength: prompt.length,
        options: {
          geometry: options.geometry,
          creativity: options.creativity,
          dynamic: options.dynamic,
          sharpen: options.sharpen,
          seed: options.seed,
        },
      },
    });

    // Track design request started
    trackDesign.requestStarted(options.designType);

    // Use withMonitoring for performance tracking and error handling
    return sentryUtils.withMonitoring(
      "design.submitDesignRequest",
      async () => {
        try {
          validateDesignRequest(file, prompt, options.designType);

          const formData = new FormData();
          formData.append("image", file);
          formData.append("prompt", prompt);
          formData.append("geometry", options.geometry.toString());
          formData.append("creativity", options.creativity.toString());
          formData.append("dynamic", options.dynamic.toString());
          formData.append("sharpen", options.sharpen.toString());
          formData.append("seed", options.seed.toString());

          const { data } = await designApi.post<DesignSubmitResponse>(
            DESIGN_ROUTES.submit(options.designType),
            formData
          );

          // Check for error status in response body (even with 200 OK)
          if (data.status === "error") {
            // Check if this is an authentication error in response body
            if (
              data.message &&
              (data.message.toLowerCase().includes("token is expired") ||
                data.message.toLowerCase().includes("authentication failed") ||
                data.message.toLowerCase().includes("invalid token"))
            ) {
              // Force logout for auth errors
              localStorage.removeItem("token");
              sessionStorage.setItem("autoLogout", "true");
              window.location.href = "/login";

              throw ApiError.unauthorized(
                "Your session has expired. Please login again."
              );
            }

            throw ApiError.fromResponse(
              "API_ERROR",
              data.message || "Unknown error",
              {}
            );
          }

          // Track design request submitted
          trackDesign.requestSubmitted(options.designType);

          return data;
        } catch (error) {
          // Handle API errors
          if (error instanceof ApiError) {
            throw error;
          }

          if (axios.isAxiosError(error) && error.response) {
            // Check if this is an auth error
            if (
              error.response.status === 401 ||
              (error.response.data?.message &&
                (error.response.data.message
                  .toLowerCase()
                  .includes("authentication failed") ||
                  error.response.data.message
                    .toLowerCase()
                    .includes("token is expired") ||
                  error.response.data.message
                    .toLowerCase()
                    .includes("invalid token")))
            ) {
              // Force logout for auth errors
              localStorage.removeItem("token");
              sessionStorage.setItem("autoLogout", "true");
              window.location.href = "/login";

              // Return early to prevent additional error handling
              throw ApiError.unauthorized(
                "Your session has expired. Please login again."
              );
            }

            // For Axios errors, capture the full response
            const responseData = error.response.data;

            // Set tags for better filtering
            if (responseData && responseData.code) {
              sentryUtils.setTag("error_code", responseData.code);
            }

            // Create a more descriptive error message that includes details
            let errorMessage =
              responseData.message || "Failed to submit design request";
            if (responseData.details) {
              // Create a formatted error message with details
              const detailsStr = JSON.stringify(responseData.details, null, 2);
              errorMessage = `${errorMessage}\nDetails: ${detailsStr}`;

              // Set additional tags for specific error types
              if (responseData.details.receivedType) {
                sentryUtils.setTag(
                  "received_type",
                  responseData.details.receivedType
                );
              }
            }

            // Create a new error with the detailed message
            const detailedError = new Error(errorMessage);

            // Capture the full API response
            sentryUtils.captureException(detailedError, {
              extra: {
                endpoint: DESIGN_ROUTES.submit(options.designType),
                method: "POST",
                status: error.response.status,
                statusText: error.response.statusText,
                responseData: responseData,
                requestData: {
                  designType: options.designType,
                  fileSize: file.size,
                  promptLength: prompt.length,
                  options: {
                    geometry: options.geometry,
                    creativity: options.creativity,
                    dynamic: options.dynamic,
                    sharpen: options.sharpen,
                    seed: options.seed,
                  },
                },
              },
            });

            // Create a more informative ApiError with the response details
            if (responseData && responseData.code && responseData.message) {
              throw ApiError.fromResponse(
                responseData.code,
                responseData.message,
                responseData.details
              );
            }
          }
          throw ApiError.internal("Failed to submit design request");
        }
      },
      {
        designType: options.designType,
        fileSize: file.size,
        promptLength: prompt.length,
      }
    );
  },

  /**
   * Check the status of a design request
   */
  checkDesignStatus: async (
    requestId: string
  ): Promise<DesignStatusResponse> => {
    // Add breadcrumb for debugging
    sentryUtils.addBreadcrumb({
      category: "design",
      message: "Checking design status",
      level: "info",
      data: { requestId },
    });

    return sentryUtils.withMonitoring(
      "design.checkDesignStatus",
      async () => {
        try {
          if (!requestId) {
            throw ApiError.badRequest(
              "Request ID is required",
              "MISSING_REQUEST_ID"
            );
          }

          const { data } = await designApi.get<DesignStatusResponse>(
            DESIGN_ROUTES.status(requestId)
          );

          // Check for error status in response body (even with 200 OK)
          if (data.status === "error") {
            // Check if this is an authentication error in response body
            if (
              data.message &&
              (data.message.toLowerCase().includes("token is expired") ||
                data.message.toLowerCase().includes("authentication failed") ||
                data.message.toLowerCase().includes("invalid token"))
            ) {
              // Force logout for auth errors
              localStorage.removeItem("token");
              sessionStorage.setItem("autoLogout", "true");
              window.location.href = "/login";

              throw ApiError.unauthorized(
                "Your session has expired. Please login again."
              );
            }

            throw ApiError.fromResponse(
              "API_ERROR",
              data.message || "Unknown error",
              {}
            );
          }

          // If the design is complete, track that the result was viewed
          if (data.status === "success") {
            trackDesign.resultViewed("interior");

            // Add a breadcrumb for successful design completion
            sentryUtils.addBreadcrumb({
              category: "design",
              message: "Design completed successfully",
              level: "info",
              data: { requestId },
            });
          }

          return data;
        } catch (error) {
          if (error instanceof ApiError) {
            // Add the ApiError to Sentry with its code and details
            sentryUtils.setTag(
              "error_code",
              (error as ApiError).code || "unknown"
            );

            // Capture the full error details in Sentry
            sentryUtils.captureException(error, {
              extra: {
                apiErrorDetails: {
                  code: error.code,
                  message: error.message,
                  details: error.details,
                },
              },
            });

            throw error;
          } else if (axios.isAxiosError(error) && error.response) {
            // For Axios errors, capture the full response
            const responseData = error.response.data;

            // Set tags for better filtering
            if (responseData && responseData.code) {
              sentryUtils.setTag("error_code", responseData.code);
            }

            // Create a more descriptive error message that includes details
            let errorMessage =
              responseData.message || "Failed to check design status";
            if (responseData.details) {
              // Create a formatted error message with details
              const detailsStr = JSON.stringify(responseData.details, null, 2);
              errorMessage = `${errorMessage}\nDetails: ${detailsStr}`;

              // Set additional tags for specific error types
              if (responseData.details.receivedType) {
                sentryUtils.setTag(
                  "received_type",
                  responseData.details.receivedType
                );
              }
            }

            // Create a new error with the detailed message
            const detailedError = new Error(errorMessage);

            // Capture the full API response
            sentryUtils.captureException(detailedError, {
              extra: {
                endpoint: DESIGN_ROUTES.status(requestId),
                method: "GET",
                status: error.response.status,
                statusText: error.response.statusText,
                responseData: responseData,
                requestData: { requestId },
              },
            });

            // Create a more informative ApiError with the response details
            if (responseData && responseData.code && responseData.message) {
              throw ApiError.fromResponse(
                responseData.code,
                responseData.message,
                responseData.details
              );
            }
          }
          throw ApiError.internal("Failed to check design status");
        }
      },
      { requestId }
    );
  },

  /**
   * Get a proxy URL for viewing an image
   */
  getImageProxyUrl: (imageUrl: string): string => {
    return `${baseURL}${DESIGN_ROUTES.viewImage(imageUrl)}`;
  },
};

export default designService;

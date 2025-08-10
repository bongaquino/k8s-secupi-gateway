interface ApiResponseSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

interface ApiResponseError {
  success: false;
  error: {
    message: string;
    code: string;
  };
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

export const apiResponse = {
  success<T>(data: T, message?: string): ApiResponseSuccess<T> {
    return {
      success: true,
      data,
      message,
    };
  },

  error(message: string, code: string = "UNKNOWN_ERROR"): ApiResponseError {
    return {
      success: false,
      error: {
        message,
        code,
      },
    };
  },
};

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR",
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message: string, code: string = "BAD_REQUEST") {
    return new ApiError(message, 400, code);
  }

  static unauthorized(
    message: string = "Unauthorized",
    code: string = "UNAUTHORIZED"
  ) {
    return new ApiError(message, 401, code);
  }

  static forbidden(message: string = "Forbidden", code: string = "FORBIDDEN") {
    return new ApiError(message, 403, code);
  }

  static notFound(message: string = "Not Found", code: string = "NOT_FOUND") {
    return new ApiError(message, 404, code);
  }

  static tooManyRequests(
    message: string = "Too Many Requests",
    code: string = "RATE_LIMIT"
  ) {
    return new ApiError(message, 429, code);
  }

  static internal(
    message: string = "Internal Server Error",
    code: string = "INTERNAL_ERROR",
    details?: Record<string, any>
  ) {
    return new ApiError(message, 500, code, details);
  }
  
  /**
   * Create an ApiError from a server response
   */
  static fromResponse(
    code: string,
    message: string,
    details?: Record<string, any>
  ) {
    // Map common error codes to appropriate status codes
    let statusCode = 500;
    if (code.includes("INVALID") || code.includes("MISSING")) {
      statusCode = 400;
    } else if (code.includes("UNAUTHORIZED") || code.includes("TOKEN")) {
      statusCode = 401;
    } else if (code.includes("FORBIDDEN")) {
      statusCode = 403;
    } else if (code.includes("NOT_FOUND")) {
      statusCode = 404;
    } else if (code.includes("RATE_LIMIT")) {
      statusCode = 429;
    }
    
    return new ApiError(message, statusCode, code, details);
  }
}

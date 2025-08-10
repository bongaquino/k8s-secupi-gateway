export interface DesignOptions {
  geometry: number;
  creativity: number;
  dynamic: number;
  sharpen: number;
  seed: number;
  designType: "interior" | "exterior";
}

// Response interfaces with common error properties
interface BaseResponse {
  status: string;
  message?: string;
}

// Initial submission response
export interface DesignSubmitResponse extends BaseResponse {
  status: string; // Could be "success" or "error"
  message?: string; // Present in error responses
  id?: string; // Present in success responses
  seed?: number; // Present in success responses
  prompt?: string; // Present in success responses
}

// Status check response
export interface DesignStatusResponse extends BaseResponse {
  status: "starting" | "processing" | "success" | "error";
  message?: string; // Present in error responses
  id?: string;
  generated_images?: string[];
  prompt?: string;
  seed?: number;
}

export type ApiType = "internal" | "external";

// Module augmentation for axios to support request metadata
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

export {};

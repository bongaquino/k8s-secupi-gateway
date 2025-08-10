/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HOST: string;
  readonly VITE_PORT: string;
  readonly VITE_NODE_ENV: string;
  readonly VITE_API_KEY: string;
  readonly VITE_INTERNAL_API_BASE_URL: string;
  readonly VITE_INTERNAL_API_KEY: string;
  readonly VITE_EXTERNAL_API_BASE_URL: string;
  readonly VITE_EXTERNAL_API_KEY: string;
  readonly VITE_DEFAULT_GEOMETRY: string;
  readonly VITE_DEFAULT_CREATIVITY: string;
  readonly VITE_DEFAULT_DYNAMIC: string;
  readonly VITE_DEFAULT_SHARPEN: string;
  readonly VITE_DEFAULT_SEED: string;
  readonly VITE_MAX_FILE_SIZE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

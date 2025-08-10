interface Config {
  server: {
    host: string;
    port: number;
    env: string;
  };
  api: {
    user: {
      baseUrl: string;
    };
    internal: {
      baseUrl: string;
      key: string;
    };
    external: {
      baseUrl: string;
      key: string;
    };
    defaultParams: {
      geometry: number;
      creativity: number;
      dynamic: number;
      sharpen: number;
      seed: number;
    };
  };
  upload: {
    maxFileSize: number;
    allowedMimeTypes: string[];
  };
}

const config: Config = {
  server: {
    host: import.meta.env.VITE_HOST || "0.0.0.0",
    port: parseInt(import.meta.env.VITE_PORT || "3000", 10),
    env: import.meta.env.VITE_NODE_ENV || "development",
  },
  api: {
    user: {
      baseUrl: import.meta.env.VITE_USER_API_BASE_URL || "",
    },
    internal: {
      baseUrl: import.meta.env.VITE_INTERNAL_API_BASE_URL || "",
      key:
        import.meta.env.VITE_INTERNAL_API_KEY ||
        import.meta.env.VITE_API_KEY ||
        "",
    },
    external: {
      baseUrl: import.meta.env.VITE_EXTERNAL_API_BASE_URL || "",
      key:
        import.meta.env.VITE_EXTERNAL_API_KEY ||
        import.meta.env.VITE_API_KEY ||
        "",
    },
    defaultParams: {
      geometry: parseFloat(import.meta.env.VITE_DEFAULT_GEOMETRY || "1"),
      creativity: parseFloat(import.meta.env.VITE_DEFAULT_CREATIVITY || "0.3"),
      dynamic: parseFloat(import.meta.env.VITE_DEFAULT_DYNAMIC || "5"),
      sharpen: parseFloat(import.meta.env.VITE_DEFAULT_SHARPEN || "0.5"),
      seed: parseInt(import.meta.env.VITE_DEFAULT_SEED || "453463", 10),
    },
  },
  upload: {
    maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || "10485760", 10),
    allowedMimeTypes: ["image/jpeg", "image/png", "image/gif"],
  },
};

// Validate configuration
function validateConfig(config: Config): void {
  // Check if at least one API key is provided
  if (!config.api.internal.key && !config.api.external.key) {
    console.warn(
      "Warning: No API keys provided. Set either VITE_INTERNAL_API_KEY or VITE_EXTERNAL_API_KEY"
    );
  }

  if (!config.api.user.baseUrl) {
    console.warn("Warning: VITE_USER_API_BASE_URL is not set");
  }

  // Check if API base URLs are provided
  if (!config.api.internal.baseUrl) {
    console.warn("Warning: VITE_INTERNAL_API_BASE_URL is not set");
  }

  if (!config.api.external.baseUrl) {
    console.warn("Warning: VITE_EXTERNAL_API_BASE_URL is not set");
  }

  // Validate numeric values
  if (isNaN(config.upload.maxFileSize) || config.upload.maxFileSize <= 0) {
    console.warn("Warning: Invalid MAX_FILE_SIZE. Using default: 10MB");
    config.upload.maxFileSize = 10485760;
  }
}

// Validate the configuration
validateConfig(config);

export default config;

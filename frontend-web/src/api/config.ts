export type Environment = "production" | "staging" | "local";

interface EnvironmentConfig {
  API_URL: string;
  IPFS_URL: string;
}

const environments: Record<Environment, EnvironmentConfig> = {
  production: {
    API_URL: "https://bongaquino-tyk-gateway-3rvca.ondigitalocean.app/api",
    IPFS_URL: "https://bongaquino-tyk-gateway-3rvca.ondigitalocean.app/ipfs",
  },
  staging: {
    API_URL: "http://<API_SERVER_IP>:8080/api",
    IPFS_URL: "http://<API_SERVER_IP>:8080/ipfs",
  },
  local: {
    API_URL: "http://localhost:3000/api",
    IPFS_URL: "http://localhost:3000/ipfs",
  },
};

function getCurrentEnvironment(): Environment {
  const env = import.meta.env.VITE_ENVIRONMENT as Environment;

  if (env && environments[env]) {
    return env;
  }

  return "local";
}

export const currentEnvironment = getCurrentEnvironment();
export const config = environments[currentEnvironment];

export default config;

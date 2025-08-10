import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/v1": {
          target: "https://api.mnmlai.dev",
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on("error", (err) => {
              console.log("proxy error", err);
            });
            proxy.on("proxyReq", (_, req) => {
              console.log(
                "Sending Request to the Target:",
                req.method,
                req.url
              );
            });
            proxy.on("proxyRes", (proxyRes, req) => {
              console.log(
                "Received Response from the Target:",
                proxyRes.statusCode,
                req.url
              );
            });
          },
        },
        "/api/design": {
          target: env.VITE_INTERNAL_API_BASE_URL || "http://localhost:3000",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/design/, ""),
        },
      },
    },
  };
});

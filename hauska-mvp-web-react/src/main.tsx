import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { Analytics } from "@vercel/analytics/react";
import * as Sentry from "@sentry/react";
import ErrorFallback from "./components/ErrorFallback";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions in development, adjust in production
  // Session Replay
  replaysSessionSampleRate: 0.1, // Sample rate for session replays (10%)
  replaysOnErrorSampleRate: 1.0, // Sample rate for replays when errors occur (100%)
  environment: import.meta.env.MODE, // Set environment based on Vite mode
});

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary fallback={ErrorFallback} showDialog>
    <TooltipProvider delayDuration={200}>
      <App />
      <Analytics />
    </TooltipProvider>
  </Sentry.ErrorBoundary>
);

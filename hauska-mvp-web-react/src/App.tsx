import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import UploadCard from "./components/UploadCard";
import ResultCard from "./components/ResultCard";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ChatWidget } from "./components/ChatWidget";
import ConstellationCanvas from "./components/ConstellationCanvas";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./lib/contexts/AuthContext";
import Joyride, { CallBackProps } from "react-joyride";
import { useLocation } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";

function AppContent({ isDarkMode }: { isDarkMode: boolean }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const isPublicRoute =
    location.pathname === "/login" || location.pathname === "/register";
  const [result, setResult] = useState<{
    inputImageUrl: string;
    resultImageUrl: string;
    status: "starting" | "processing" | "success";
  } | null>(null);
  const [processingTime, setProcessingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [runTour, setRunTour] = useState(false);

  const steps: any = [
    {
      target: "body", // full-page overlay, centered
      content:
        "Welcome to bongaquino! This brief tour will guide you through the key features of your workspace.",
      placement: "center", // optional, but reinforces center alignment
      disableBeacon: true, // ensures the step opens automatically
    },
    {
      target: ".header-buttons",
      content:
        "Use the header controls to personalize your experience: toggle between light and dark mode, replay this tour, access the user guide, or securely log out of your account.",
    },
    {
      target: ".upload-image",
      content:
        "Begin by uploading an image of the space. You may drag and drop a file into this field or click to select one from your device.",
    },
    {
      target: ".design-prompt",
      content:
        "Provide a brief description of your design vision. This prompt will guide the AI in generating tailored results based on your input.",
    },
    {
      target: ".design-type",
      content:
        "Select the appropriate design category. Choose 'Interior Design' for indoor spaces or 'Exterior Design' for outdoor environments.",
    },
    {
      target: ".custom-settings",
      content:
        "Adjust the available parameters to customize your design output. These settings allow you to fine-tune elements such as sharpness and AI creativity.",
    },
    {
      target: ".design-button",
      content:
        "Once all inputs are set, click here to initiate the AI design process and generate your transformed concept.",
    },
    {
      target: ".result-card",
      content:
        "Here you can view the AI-generated design based on your inputs. Review the outcome, compare with the original, and download or refine as needed.",
    },
    {
      target: "#chat-widget",
      content:
        "Need assistance with your designs? Our AI assistant, powered by Perplexity, is available below to help.",
      styles: {
        spotlight: {
          borderRadius: "50%",
        },
      },
    },
  ];

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenJoyride");
    if (!hasSeenTour && isAuthenticated && !isPublicRoute) {
      const delay = setTimeout(() => {
        setRunTour(true);
      }, 2000);
      return () => clearTimeout(delay);
    }
  }, [isAuthenticated, isPublicRoute]);

  const handleTourCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === "finished" || status === "skipped") {
      localStorage.setItem("hasSeenJoyride", "true");
      setRunTour(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated && !isPublicRoute && (
        <Joyride
          steps={steps}
          run={runTour}
          continuous={true}
          showSkipButton={true}
          showProgress={true}
          styles={{
            options: {
              primaryColor: "#3B82F6",
              backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
              textColor: isDarkMode ? "#FFFFFF" : "#000000",
              width: 600,
              zIndex: 1000,
            },
          }}
          callback={handleTourCallback}
          locale={{ last: "Done" }}
        />
      )}

      <div className="relative min-h-screen flex flex-col">
        <ConstellationCanvas />
        <div className="relative flex-grow">
          <div className="container mx-auto px-4 py-8">
            <Header setRunTour={setRunTour} />
            <Routes>
              <Route
                path="/login"
                element={
                  isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
                }
              />
              <Route
                path="/register"
                element={
                  isAuthenticated ? (
                    <Navigate to="/" replace />
                  ) : (
                    <RegisterPage />
                  )
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="col-span-1">
                        <UploadCard
                          isLoading={isLoading}
                          setIsLoading={setIsLoading}
                          setResult={setResult}
                          result={result}
                          setProcessingTime={setProcessingTime}
                        />
                      </div>
                      <div className="col-span-1 lg:col-span-2">
                        <ResultCard
                          result={result}
                          isLoading={isLoading}
                          processingTime={processingTime}
                        />
                      </div>
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
        {isAuthenticated && <ChatWidget />}
        <div>
          <Footer />
        </div>
      </div>
      <Toaster position="top-center" richColors />
    </>
  );
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false); // Define state for dark mode

  useEffect(() => {
    // Check the current theme preference and set the initial state
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const isDark =
      document.documentElement.classList.contains("dark") || prefersDark;
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // Listen for theme changes dynamically
  useEffect(() => {
    const handleThemeChange = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <AppContent isDarkMode={isDarkMode} />
      </AuthProvider>
    </Router>
  );
}

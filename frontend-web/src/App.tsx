import {
  Routes,
  Route,
  Navigate,
  BrowserRouter as Router,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainLayout } from "./layouts/MainLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/guards";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import PasswordReset from "./pages/Auth/PasswordReset";
import VerifyEmail from "./pages/Auth/VerifyEmail";
import ApiKeys from "./pages/ApiKeys";
import ApiUsage from "./pages/ApiUsage";
import Dashboard from "./pages/Dashboard";
import RecoveryManagement from "./pages/RecoveryManagement";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import FileExplorer from "./pages/FileExplorer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<FileExplorer />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="api-keys" element={<ApiKeys />} />
              <Route path="api-usage" element={<ApiUsage />} />
              <Route path="usage-and-limits" element={<ApiUsage />} />
              <Route
                path="recovery-management"
                element={<RecoveryManagement />}
              />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

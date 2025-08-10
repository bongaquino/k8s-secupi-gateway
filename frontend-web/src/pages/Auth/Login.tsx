import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeClosed } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import {
  useLogin,
  useResendVerificationCode,
  useVerifyOTP,
} from "../../hooks/useAuth";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import Logo from "../../assets/images/bongaquino-logo.png";
import { InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { InputOTP } from "@/components/ui/input-otp";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // MFA state
  const [showOtp, setShowOtp] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>("");
  const [loginCode, setLoginCode] = useState<string>("");

  const { setAuthenticated, isAuthenticated, user, loading } = useAuth();
  const { mutate: login, isPending: isLoginLoading } = useLogin();
  const { mutate: resendVerificationCode } = useResendVerificationCode();
  const { mutate: verifyOTP, isPending: isMfaLoading } = useVerifyOTP();

  useEffect(() => {
    if (isAuthenticated && user && !loading) {
      if (user.is_verified) {
        navigate("/", { replace: true });
      } else {
        navigate("/verify-email", { replace: true });
      }
    }
  }, [isAuthenticated, user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    login(
      {
        email,
        password,
      },
      {
        onSuccess: async (response) => {
          if (response.status === "error") {
            let errorMessage;
            if (response.message === "invalid credentials") {
              errorMessage = "The email or password you entered is incorrect.";
            } else {
              errorMessage = response.message || "Login failed";
            }
            toast.error(errorMessage);
            return;
          }

          if (response.data?.is_mfa_enabled && response.data?.login_code) {
            setLoginCode(response.data.login_code);
            setShowOtp(true);
            toast.success("Please enter the code from your authenticator app");
            return;
          }

          if (response.data?.access_token) {
            setAuthenticated(true);
            toast.success("Login successful");

            if (response.data.user && !response.data.user.is_verified) {
              resendVerificationCode(undefined, {
                onSuccess: (verifyResponse) => {
                  if (verifyResponse.status === "error") {
                    console.error(
                      "Failed to send verification code:",
                      verifyResponse.message
                    );
                  } else {
                    toast.success("Verification code sent to your email");
                  }
                },
                onError: (error: any) => {
                  console.error("Failed to send verification code:", error);
                },
              });
            }
          }
        },
        onError: (error: any) => {
          const apiErrorMessage = error.response?.data?.message;

          let errorMessage;
          if (apiErrorMessage === "invalid credentials") {
            errorMessage = "The email or password you entered is incorrect.";
          } else {
            errorMessage =
              apiErrorMessage ||
              error.message ||
              "Login failed. Please try again.";
          }

          toast.error(errorMessage);
        },
      }
    );
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    verifyOTP(
      {
        login_code: loginCode,
        otp,
      },
      {
        onSuccess: (response) => {
          if (response.status === "error") {
            toast.error(response.message || "Invalid verification code");
            return;
          }

          if (response.data?.access_token) {
            setAuthenticated(true);
            toast.success("Login successful");
          }
        },
        onError: (error: any) => {
          const apiErrorMessage = error.response?.data?.message;
          const errorMessage =
            apiErrorMessage ||
            error.message ||
            "Verification failed. Please try again.";
          toast.error(errorMessage);
        },
      }
    );
  };

  const handleBackToLogin = () => {
    setShowOtp(false);
    setOtp("");
    setLoginCode("");
  };

  return (
    <div className="flex flex-col justify-center min-h-screen space-y-6 py-12">
      <div className="text-center flex flex-col items-center gap-3">
        <img src={Logo} alt="bongaquino Logo" className="w-[200px] mx-auto" />
        <h1 className="text-xl md:text-2xl font-semibold text-primary mt-2">
          Ransomware Protection Solution v1.0.0
        </h1>
      </div>

      <div className="flex justify-center items-center px-4">
        <div className="w-full max-w-md bg-card rounded-xl border p-6">
          {!showOtp ? (
            <>
              <h2 className="text-xl font-medium text-center mb-2">Login</h2>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeClosed size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoginLoading}
                >
                  {isLoginLoading ? "Logging in..." : "Login"}
                </Button>

                <div className="text-center">
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Don't have an account?{" "}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate("/register")}
                      className="text-sm text-primary hover:underline cursor-pointer"
                    >
                      Create Account
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/password-reset")}
                    className="text-sm text-primary hover:underline cursor-pointer mt-3"
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-medium text-center mb-6">
                Two-Factor Authentication
              </h2>

              <p className="text-sm text-muted-foreground mb-4 text-center">
                Enter the authentication code from your Authenticator app.
              </p>

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="flex flex-col items-center justify-center gap-4 mb-6">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    containerClassName="gap-2 justify-center"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="flex justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleBackToLogin}
                  >
                    Back to Login
                  </Button>
                  <Button
                    type="submit"
                    disabled={otp.length !== 6 || isMfaLoading}
                    className="flex-1"
                  >
                    {isMfaLoading ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

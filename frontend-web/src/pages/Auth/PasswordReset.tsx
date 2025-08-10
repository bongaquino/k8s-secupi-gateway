import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import Logo from "../../assets/images/bongaquino-logo.png";
import { Eye, EyeClosed } from "lucide-react";
import type {
  ForgotPasswordResponse,
  ResetPasswordResponse,
} from "../../api/types/auth.types";
import { useForgotPassword, useResetPassword } from "@/hooks/useAuth";

const PasswordReset = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState<string>("");
  const [resetCode, setResetCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const { mutate: forgotPassword, isPending: isRequestingResetCode } =
    useForgotPassword();
  const { mutate: resetPassword, isPending: isResettingPassword } =
    useResetPassword();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    forgotPassword(
      { email },
      {
        onSuccess: (response: ForgotPasswordResponse) => {
          if (response.status === "error") {
            toast.error(response.message || "Failed to send reset code");
            return;
          }

          toast.success("Password reset code sent to your email");
          setStep("reset");
        },
        onError: (error: any) => {
          const apiErrorMessage = error.response?.data?.message;
          const errorMessage =
            apiErrorMessage ||
            error.message ||
            "Failed to send reset code. Please try again.";
          toast.error(errorMessage);
        },
      }
    );
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    resetPassword(
      {
        email,
        reset_code: resetCode,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      },
      {
        onSuccess: (response: ResetPasswordResponse) => {
          if (response.status === "error") {
            toast.error(response.message || "Failed to reset password");
            return;
          }

          toast.success(
            "Password reset successfully! Please log in with your new password."
          );
          navigate("/login");
        },
        onError: (error: any) => {
          const apiErrorMessage = error.response?.data?.message;
          const errorMessage =
            apiErrorMessage ||
            error.message ||
            "Failed to reset password. Please try again.";
          toast.error(errorMessage);
        },
      }
    );
  };

  if (step === "reset") {
    return (
      <div className="flex flex-col justify-center min-h-screen space-y-6">
        <div className="text-center flex flex-col items-center gap-3">
          <img src={Logo} alt="bongaquino Logo" className="w-[200px] mx-auto" />
          <h1 className="text-2xl font-semibold text-primary">
            Ransomware Protection Solution v1.0.0
          </h1>
        </div>

        <div className="flex justify-center items-center px-4">
          <div className="w-full max-w-md bg-card rounded-xl border p-6">
            <h2 className="text-xl font-medium text-center mb-6">
              Reset Password
            </h2>

            <p className="text-sm text-muted-foreground mb-6 text-center">
              Enter the reset code sent to your email and your new password.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetCode" className="text-sm font-medium">
                  Reset Code
                </Label>
                <Input
                  id="resetCode"
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="Enter reset code from email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmNewPassword"
                  className="text-sm font-medium"
                >
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmNewPassword"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeClosed size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-between gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("email")}
                  disabled={isResettingPassword}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isResettingPassword}
                >
                  {isResettingPassword ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

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
          <h2 className="text-xl font-medium text-center mb-4">
            Reset Password
          </h2>

          <p className="text-sm text-muted-foreground mb-4 text-center">
            Please enter your email to receive a password reset code.
          </p>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="flex justify-between gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/login")}
                disabled={isRequestingResetCode}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isRequestingResetCode}
              >
                {isRequestingResetCode ? "Sending..." : "Send Reset Code"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;

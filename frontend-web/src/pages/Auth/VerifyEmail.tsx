import {
  useVerifyAccount,
  useResendVerificationCode,
} from "../../hooks/useAuth";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { formatCooldownTime } from "@/utils/formatCooldownTime";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "@/lib/utils";
import Logo from "../../assets/images/bongaquino-logo.png";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [verificationCode, setVerificationCode] = useState<string>("");
  const [cooldown, setCooldown] = useState<number>(0);

  const { mutate: verifyAccount, isPending: isVerifyingEmail } =
    useVerifyAccount();
  const { mutate: resendCode, isPending: isResendingVerification } =
    useResendVerificationCode();
  const { user, isAuthenticated, refreshUser, logout } = useAuth();

  const email = user?.email || location.state?.email || "";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    if (user?.is_verified) {
      navigate("/", { replace: true });
      return;
    }
  }, [isAuthenticated, user, navigate]);

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    verifyAccount(
      { verification_code: verificationCode },
      {
        onSuccess: async (response) => {
          if (response.status === "error") {
            toast.error(response.message || "Email verification failed");
            return;
          }
          toast.success("Email verified successfully!");
          await refreshUser();
          navigate("/", { replace: true });
        },
        onError: (error: any) => {
          const apiErrorMessage = error.response?.data?.message;
          const errorMessage =
            apiErrorMessage ||
            error.message ||
            "Email verification failed. Please try again.";
          toast.error(errorMessage);
        },
      }
    );
  };

  const handleResendCode = async () => {
    resendCode(undefined, {
      onSuccess: (response) => {
        if (response.status === "error") {
          toast.error(response.message || "Failed to resend verification code");
          return;
        }

        toast.success("Verification code sent to your email");
        setCooldown(120); // Reset cooldown after successful resend
      },
      onError: (error: any) => {
        // Extract the actual API error message from the response
        const apiErrorMessage = error.response?.data?.message;
        const errorMessage =
          apiErrorMessage ||
          error.message ||
          "Failed to resend verification code. Please try again.";
        toast.error(errorMessage);
      },
    });
  };

  const handleBackToLogin = () => {
    logout();
  };

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;

    if (cooldown > 0) {
      timerId = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [cooldown]);

  if (!isAuthenticated || user?.is_verified) {
    return null;
  }

  return (
    <div className="flex flex-col justify-center min-h-screen space-y-6">
      <div className="text-center flex flex-col items-center gap-3">
        <img src={Logo} alt="bongaquino Logo" className="w-[200px] mx-auto" />
        <h1 className="text-xl md:text-2xl font-semibold text-primary mt-2">
          Ransomware Protection Solution v1.0.0
        </h1>
      </div>

      <div className="flex justify-center items-center px-4">
        <div className="w-full max-w-md bg-card rounded-xl border p-6">
          <h2 className="text-xl font-medium text-center mb-6">
            Verify Your Email
          </h2>

          <p className="text-sm text-muted-foreground mb-6 text-center">
            Your account is not verified. A verification code has been sent to{" "}
            <strong>{email}</strong>. Please enter the code to verify your
            account and access the application.
          </p>

          <form onSubmit={handleVerifyEmail} className="space-y-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <InputOTP
                maxLength={6}
                value={verificationCode}
                onChange={(value) => setVerificationCode(value)}
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

            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={cooldown > 0 || isResendingVerification}
                className={cn(
                  "text-sm text-primary flex items-center gap-1 hover:underline cursor-pointer",
                  (cooldown > 0 || isResendingVerification) &&
                    "opacity-50 cursor-not-allowed hover:no-underline"
                )}
              >
                <RefreshCw
                  size={14}
                  className={isResendingVerification ? "animate-spin" : ""}
                />
                {cooldown > 0
                  ? `Resend code in ${formatCooldownTime(cooldown)}`
                  : isResendingVerification
                  ? "Sending..."
                  : "Didn't receive a code? Resend"}
              </button>
            </div>

            <div className="flex justify-between gap-2 mt-6">
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
                className="flex-1"
                disabled={verificationCode.length !== 6 || isVerifyingEmail}
              >
                {isVerifyingEmail ? "Verifying..." : "Verify Email"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

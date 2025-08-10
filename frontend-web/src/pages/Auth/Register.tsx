import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Eye, EyeClosed } from "lucide-react";
import { toast } from "sonner";
import { useRegister } from "../../hooks/useAuth";
import { useAuth } from "../../contexts/AuthContext";
import Logo from "../../assets/images/bongaquino-logo.png";

const Register = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const { mutate: register, isPending: isCreatingAccount } = useRegister();
  const { setAuthenticated, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.is_verified) {
        navigate("/", { replace: true });
      } else {
        navigate("/verify-email", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    const passwordRequirements = [
      {
        text: "At least 8 characters long",
        met: formData.password.length >= 8,
      },
      {
        text: "At least 1 uppercase letter",
        met: /[A-Z]/.test(formData.password),
      },
      { text: "At least 1 number", met: /\d/.test(formData.password) },
      {
        text: "At least 1 special character",
        met: /[!@#$%^&*()_+]/.test(formData.password),
      },
    ];

    const unmetRequirements = passwordRequirements.filter((req) => !req.met);
    if (unmetRequirements.length > 0) {
      toast.error("Please meet all password requirements");
      return;
    }

    register(
      {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
      },
      {
        onSuccess: (response) => {
          if (response.status === "error") {
            toast.error(response.message || "Registration failed");
            return;
          }

          if (response.data?.tokens?.access_token) {
            // Set authentication state
            setAuthenticated(true);

            toast.success(
              "Account created successfully! Please verify your email."
            );
            // Navigation will be handled by the useEffect above after user data loads
          }
        },
        onError: (error: any) => {
          // Extract the actual API error message from the response
          const apiErrorMessage = error.response?.data?.message;
          const errorMessage =
            apiErrorMessage ||
            error.message ||
            "Registration failed. Please try again.";
          toast.error(errorMessage);
        },
      }
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
          <h2 className="text-xl font-medium text-center mb-6">
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-sm font-medium">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                    handleInputChange("first_name", e.target.value)
                  }
                  placeholder="Enter first name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-sm font-medium">
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={(e) =>
                    handleInputChange("last_name", e.target.value)
                  }
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
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
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Enter password"
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
              <Label htmlFor="confirm_password" className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm_password"
                  value={formData.confirm_password}
                  onChange={(e) =>
                    handleInputChange("confirm_password", e.target.value)
                  }
                  placeholder="Re-enter password"
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

            <div className="bg-secondary/30 rounded-md p-4 text-sm">
              <p className="font-medium mb-2">Password requirements:</p>
              <ul className="list-disc ml-5 space-y-1 text-muted-foreground">
                <li>At least 8 characters long</li>
                <li>At least 1 uppercase letter</li>
                <li>At least 1 number</li>
                <li>At least 1 special character (!@#$%^&*()_+)</li>
              </ul>
            </div>

            <div className="flex justify-between gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/login")}
                disabled={isCreatingAccount}
              >
                Back to Login
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isCreatingAccount}
              >
                {isCreatingAccount ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

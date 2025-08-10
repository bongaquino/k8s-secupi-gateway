import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Wand2, Layers, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const INDUSTRY_ASSOCIATIONS = [
  "American Institute of Building Design (AIBD)",
  "Architecture & Design",
  "Engineering",
  "Construction",
  "Development & Real Estate",
  "Fabrication & Manufacturing",
  "Technology & Innovation",
  "Education & Student Track",
  "FB Residential Design Professionals Group",
  "Other",
];

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showExtendedForm, setShowExtendedForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company_name: "",
    phone_number: "",
    industry_association: "",
    is_student: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [id]: value,
      };

      // Check password match when either password field changes
      if (id === "password" || id === "confirmPassword") {
        const otherValue =
          id === "password"
            ? newFormData.confirmPassword
            : newFormData.password;

        // Only validate if both fields have content
        if (value && otherValue) {
          setPasswordMatch(value === otherValue);
        } else {
          setPasswordMatch(true); // Reset validation if either field is empty
        }
      }

      return newFormData;
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      industry_association: value,
    }));
  };

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      is_student: value === "yes",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setPasswordMatch(false);
      return;
    }

    if (!showExtendedForm) {
      setShowExtendedForm(true);
      return;
    }

    setLoading(true);

    try {
      const registerData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        company_name: formData.company_name,
        phone_number: formData.phone_number,
        industry_association: formData.industry_association,
        is_student: formData.is_student,
      };

      console.log(registerData);

      await register(registerData);
      toast.success("Your account has been created successfully");
      navigate("/login");
    } catch (error: any) {
      // Get the error message from the API response
      const errorMessage =
        error.message || "Failed to register. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
        {/* Left side - Features */}
        <div className="flex flex-col justify-center space-y-8 order-2 md:order-1">
          <div className="space-y-4 text-center sm:text-left">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">
              Transform Your Architectural Designs with AI
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Join Hauska.io and unlock the power of AI-driven design
              transformation
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wand2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Intelligent Design Processing</h3>
                <p className="text-muted-foreground">
                  Transform blueprints and sketches into stunning visualizations
                  with our advanced AI
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Interior & Exterior Expertise</h3>
                <p className="text-muted-foreground">
                  Specialized in both interior and exterior architectural
                  transformations
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Customizable Results</h3>
                <p className="text-muted-foreground">
                  Fine-tune your designs with adjustable parameters for
                  geometry, creativity, and dynamics
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Registration Form */}
        <div className="w-full max-w-md mx-auto order-1 md:order-2">
          <div className="space-y-6 bg-card p-6 rounded-lg border shadow-sm">
            <div className="text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an Account
              </h1>
              <p className="text-sm text-muted-foreground">
                {showExtendedForm
                  ? "Please provide some additional information"
                  : "Please fill in the information below"}
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {!showExtendedForm ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        type="text"
                        placeholder="First Name"
                        className="bg-background"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        type="text"
                        placeholder="Last Name"
                        className="bg-background"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email"
                      className="bg-background"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        className={`bg-background ${
                          !passwordMatch ? "border-red-500" : ""
                        }`}
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        className={`bg-background ${
                          !passwordMatch ? "border-red-500" : ""
                        }`}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                    {!passwordMatch && (
                      <p className="text-red-500 text-sm mt-1">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                      required
                      id="company_name"
                      type="text"
                      placeholder="Your company name"
                      className="bg-background"
                      value={formData.company_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      required
                      id="phone_number"
                      type="tel"
                      placeholder="Your phone number"
                      className="bg-background"
                      value={formData.phone_number}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="industry_association">
                      Industry Association
                    </Label>
                    <Select
                      required
                      value={formData.industry_association}
                      onValueChange={handleSelectChange}
                    >
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue placeholder="Select an industry association" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRY_ASSOCIATIONS.map((association) => (
                          <SelectItem key={association} value={association}>
                            {association}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <Label>Are you a student?</Label>
                    <RadioGroup
                      value={formData.is_student ? "yes" : "no"}
                      onValueChange={handleRadioChange}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="student-yes" />
                        <Label htmlFor="student-yes">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="student-no" />
                        <Label htmlFor="student-no">No</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </>
              )}

              <div className="flex flex-col gap-1">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    loading ||
                    (!showExtendedForm &&
                      !passwordMatch &&
                      Boolean(formData.password) &&
                      Boolean(formData.confirmPassword))
                  }
                >
                  {loading
                    ? "Creating account..."
                    : showExtendedForm
                    ? "Register"
                    : "Next"}
                </Button>

                {showExtendedForm && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => setShowExtendedForm(false)}
                  >
                    Back
                  </Button>
                )}
              </div>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Already have an account?{" "}
              </span>
              <a
                onClick={() => navigate("/login")}
                className="text-primary hover:underline cursor-pointer"
              >
                Login here
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

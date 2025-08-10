import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useState, useEffect } from "react";
import {
  Shield,
  Key,
  AlertCircle,
  Eye,
  EyeClosed,
  Loader2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import {
  useChangePassword,
  useGenerateOTP,
  useEnableMFA,
  useDisableMFA,
} from "../../hooks/useAuth";

const Settings = () => {
  const { user, refreshUser } = useAuth();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showDisablePassword, setShowDisablePassword] = useState(false);
  const [mfaVerificationCode, setMfaVerificationCode] = useState("");
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [mfaSetupData, setMfaSetupData] = useState<{
    otp_secret: string;
    qr_code: string;
  } | null>(null);

  const { mutate: changePassword, isPending: isPasswordLoading } =
    useChangePassword();
  const { refetch: generateOTP, isFetching: isGeneratingOTP } =
    useGenerateOTP();
  const { mutate: enableMFA, isPending: isEnablingMFA } = useEnableMFA();
  const { mutate: disableMFA, isPending: isDisablingMFA } = useDisableMFA();

  const isMfaEnabled = user?.is_mfa_enabled ?? false;
  const isMfaLoading = isGeneratingOTP || isEnablingMFA || isDisablingMFA;

  const handleChangePassword = () => {
    if (!oldPassword) {
      toast.error("Current password is required");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }

    changePassword(
      {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      },
      {
        onSuccess: (response) => {
          if (response.status === "success") {
            toast.success("Password changed successfully!");
            setOldPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
          } else {
            toast.error(response.message || "Failed to change password");
          }
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to change password";
          toast.error(errorMessage);
        },
      }
    );
  };

  const handleMfaToggle = async (enabled: boolean) => {
    if (enabled && !isMfaEnabled) {
      setSettings((prev) => ({
        ...prev,
        security: { ...prev.security, twoFactor: true },
      }));

      const result = await generateOTP();
      if (result.data?.data) {
        setMfaSetupData(result.data.data);
      }
    } else if (!enabled && isMfaEnabled) {
      setShowDisableDialog(true);
    } else if (!enabled && !isMfaEnabled) {
      setSettings((prev) => ({
        ...prev,
        security: { ...prev.security, twoFactor: false },
      }));
      setMfaSetupData(null);
      setMfaVerificationCode("");
    }
  };

  const handleDisableMfa = () => {
    if (!disablePassword) {
      toast.error("Password is required to disable Two-Factor Authentication");
      return;
    }

    disableMFA(
      { password: disablePassword },
      {
        onSuccess: async (response: any) => {
          if (response.status === "success") {
            toast.success("Two-Factor Authentication disabled successfully!");
            setShowDisableDialog(false);
            setDisablePassword("");
            setSettings((prev) => ({
              ...prev,
              security: { ...prev.security, twoFactor: false },
            }));
            await refreshUser();
          } else {
            toast.error(
              response.message || "Failed to disable Two-Factor Authentication"
            );
          }
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to disable Two-Factor Authentication";
          toast.error(errorMessage);
        },
      }
    );
  };

  const handleVerifyAndEnableMfa = () => {
    if (!mfaVerificationCode || mfaVerificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }

    enableMFA(
      { otp: mfaVerificationCode },
      {
        onSuccess: async (response: any) => {
          if (response.status === "success") {
            toast.success("Two-Factor Authentication enabled successfully!");
            setMfaVerificationCode("");
            setMfaSetupData(null);
            // Refresh user data to update MFA status
            await refreshUser();
          } else {
            toast.error(
              response.message || "Failed to enable Two-Factor Authentication"
            );
          }
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to enable Two-Factor Authentication";
          toast.error(errorMessage);
        },
      }
    );
  };

  const [settings, setSettings] = useState<{
    security: {
      twoFactor: boolean;
      email: string;
      qrCodeUrl: string;
    };
  }>({
    security: {
      twoFactor: isMfaEnabled,
      email: "",
      qrCodeUrl: "",
    },
  });

  useEffect(() => {
    if (user) {
      setSettings((prev) => ({
        ...prev,
        security: { ...prev.security, twoFactor: user.is_mfa_enabled },
      }));
    }
  }, [user]);

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Settings
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="h-full gap-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Shield className="h-5 w-5 text-blue-500" />
              Account Security
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-1">
            <div className="grid gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">
                    Add an extra layer of security using an authenticator app
                  </p>
                </div>
                <Switch
                  checked={isMfaEnabled || settings.security.twoFactor}
                  onCheckedChange={handleMfaToggle}
                  disabled={isMfaLoading}
                />
              </div>

              {isGeneratingOTP && (
                <div className="flex items-center justify-center p-8">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-600">
                      Generating QR code...
                    </span>
                  </div>
                </div>
              )}

              {mfaSetupData && (
                <div className="space-y-4">
                  <div className="p-4 md:p-6 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                      <div className="w-48 h-48 border rounded-lg flex items-center justify-center bg-white shadow-sm p-3 mx-auto md:mx-0">
                        <QRCodeSVG
                          value={mfaSetupData.qr_code}
                          size={180}
                          className="mx-auto"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-medium mb-4">
                          Setup Instructions
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="min-w-6 min-h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                              1
                            </div>
                            <p className="text-sm text-gray-600">
                              Install an authenticator app like Google
                              Authenticator or Authy on your mobile device
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="min-w-6 min-h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                              2
                            </div>
                            <p className="text-sm text-gray-600">
                              Scan the QR code in your authenticator app
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="min-w-6 min-h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                              3
                            </div>
                            <p className="text-sm text-gray-600">
                              Enter the 6-digit verification code from your app
                              to complete setup
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <Label
                        htmlFor="verificationCode"
                        className="text-sm font-medium block mb-2"
                      >
                        Verification Code
                      </Label>
                      <div className="flex gap-2 md:gap-3">
                        <Input
                          id="verificationCode"
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          value={mfaVerificationCode}
                          onChange={(e) =>
                            setMfaVerificationCode(
                              e.target.value.replace(/\D/g, "")
                            )
                          }
                          placeholder="Enter 6-digit code"
                          disabled={isEnablingMFA}
                        />
                        <Button
                          onClick={handleVerifyAndEnableMfa}
                          disabled={
                            mfaVerificationCode.length !== 6 || isEnablingMFA
                          }
                          className="bg-primary hover:bg-primary/90"
                        >
                          {isEnablingMFA ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            "Verify"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!isMfaEnabled && !mfaSetupData && (
                <div className="space-y-4">
                  <div className="p-4 bg-red-50/50 rounded-lg border border-red-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full xl:bg-red-100 flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="font-medium text-red-800 text-sm md:text-base">
                          Your account is not fully protected
                        </h4>
                        <p className="text-xs md:text-sm text-red-600">
                          Enable Two-Factor Authentication to add an extra layer
                          of security
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isMfaEnabled && !mfaSetupData && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full xl:bg-green-100 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="font-medium text-green-800 text-sm md:text-base">
                        Two-Factor Authentication is enabled
                      </h4>
                      <p className="text-xs md:text-sm text-green-600">
                        Your account is protected with an additional layer of
                        security
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="h-full gap-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-medium">
              <Key className="h-5 w-5 text-blue-500" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-1">
            <div className="grid gap-6">
              <div className="space-y-4 flex flex-col">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword" className="text-sm font-medium">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showOldPassword ? "text" : "password"}
                      id="oldPassword"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                      {showOldPassword ? (
                        <EyeClosed size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeClosed size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
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
                      placeholder="Re-enter new password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeClosed size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  className="w-fit self-end"
                  onClick={handleChangePassword}
                  disabled={isPasswordLoading}
                >
                  {isPasswordLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    "Change Password"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="sm:max-w-[475px]">
          <DialogHeader className="gap-2">
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Disable Two-Factor Authentication
            </DialogTitle>
            <DialogDescription className="text-left">
              This will remove an important security feature from your account.
              Please confirm your password to continue.
            </DialogDescription>
          </DialogHeader>
          <div>
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showDisablePassword ? "text" : "password"}
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowDisablePassword(!showDisablePassword)}
                >
                  {showDisablePassword ? (
                    <EyeClosed size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2 md:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowDisableDialog(false);
                setDisablePassword("");
                setShowDisablePassword(false);
              }}
              disabled={isEnablingMFA}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisableMfa}
              disabled={isEnablingMFA}
            >
              {isEnablingMFA ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Disabling...
                </>
              ) : (
                "Disable Two-Factor Authentication"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;

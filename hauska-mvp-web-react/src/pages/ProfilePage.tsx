import { useAuth } from "@/lib/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <p>Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <h1 className="text-3xl font-bold mb-6">My Account</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">First Name</Label>
              <p className="text-lg font-medium">{user.first_name || "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Last Name</Label>
              <p className="text-lg font-medium">{user.last_name || "N/A"}</p>
            </div>
            {user.middle_name && (
              <div>
                <Label className="text-muted-foreground">Middle Name</Label>
                <p className="text-lg font-medium">{user.middle_name}</p>
              </div>
            )}
            {user.suffix && (
              <div>
                <Label className="text-muted-foreground">Suffix</Label>
                <p className="text-lg font-medium">{user.suffix}</p>
              </div>
            )}
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="text-lg font-medium">{user.email || "N/A"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Phone Number</Label>
              <p className="text-lg font-medium">
                {user.phone_number || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Company Name</Label>
              <p className="text-lg font-medium">
                {user.company_name || "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">
                Industry Association
              </Label>
              <p className="text-lg font-medium">
                {user.industry_association || "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Student Status</Label>
              <p className="text-lg font-medium">
                {user.is_student ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
    </div>
  );
}

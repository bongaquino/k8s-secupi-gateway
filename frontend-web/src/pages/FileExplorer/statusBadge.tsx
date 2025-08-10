import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

export const renderStatusBadge = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3.5 w-3.5 mr-1" />
          Completed
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <Clock className="h-3.5 w-3.5 mr-1" />
          In Progress
        </Badge>
      );
    case "ERROR":
    case "FAILED":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <AlertCircle className="h-3.5 w-3.5 mr-1" />
          Failed
        </Badge>
      );
    default:
      return null;
  }
};

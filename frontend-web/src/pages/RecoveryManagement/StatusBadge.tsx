import { Clock, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RecoveryRequest } from "./types";

export const getStatusBadge = (status: RecoveryRequest["status"]) => {
  const variants = {
    pending: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Clock,
    },
    "in-progress": {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: RefreshCw,
    },
    completed: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle2,
    },
    failed: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: AlertCircle,
    },
  };

  const { color, icon: Icon } = variants[status];

  return (
    <Badge className={`${color} flex items-center gap-1`}>
      <Icon className="h-3.5 w-3.5 mr-1" />
      <span className="capitalize">{status}</span>
    </Badge>
  );
};

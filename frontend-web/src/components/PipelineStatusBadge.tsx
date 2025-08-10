import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, XCircle, Pause } from "lucide-react";

export type PipelineStatus = "SUCCEEDED" | "FAILED" | "IN_PROGRESS" | "STOPPED" | "STARTED" | "CANCELED" | "SUPERSEDED";

interface PipelineStatusBadgeProps {
  status: PipelineStatus;
  className?: string;
}

export const PipelineStatusBadge = ({ status, className = "" }: PipelineStatusBadgeProps) => {
  const getStatusConfig = (status: PipelineStatus) => {
    switch (status) {
      case "SUCCEEDED":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: CheckCircle,
          label: "Succeeded",
        };
      case "FAILED":
        return {
          color: "bg-red-100 text-red-800 border-red-200", 
          icon: XCircle,
          label: "Failed",
        };
      case "IN_PROGRESS":
      case "STARTED":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: Clock,
          label: status === "STARTED" ? "Started" : "In Progress",
        };
      case "STOPPED":
      case "CANCELED":
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Pause,
          label: status === "STOPPED" ? "Stopped" : "Canceled",
        };
      case "SUPERSEDED":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: AlertCircle,
          label: "Superseded",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: AlertCircle,
          label: status,
        };
    }
  };

  const { color, icon: Icon, label } = getStatusConfig(status);

  return (
    <Badge className={`${color} flex items-center gap-1 ${className}`}>
      <Icon className="h-3.5 w-3.5 mr-1" />
      <span className="capitalize">{label}</span>
    </Badge>
  );
};

// Component for pipeline stage status
export interface PipelineStageStatusProps {
  stageName: string;
  status: PipelineStatus;
  pipelineName: string;
  environment?: string;
  timestamp?: string;
  className?: string;
}

export const PipelineStageStatus = ({ 
  stageName, 
  status, 
  pipelineName, 
  environment = "STAGING",
  timestamp,
  className = "" 
}: PipelineStageStatusProps) => {
  const isFailure = status === "FAILED";
  
  return (
    <div className={`p-4 border rounded-lg ${isFailure ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'} ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isFailure ? 'bg-red-500' : 'bg-blue-500'}`} />
          <span className="font-medium text-sm">Stage: {stageName}</span>
        </div>
        <PipelineStatusBadge status={status} />
      </div>
      
      <div className="text-sm text-gray-600 mb-1">
        Stage {stageName} in pipeline {pipelineName} is {status}
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Environment: {environment}</span>
        {timestamp && <span>{timestamp}</span>}
      </div>
    </div>
  );
};

// Component for overall pipeline status  
export const PipelineExecutionStatus = ({
  pipelineName,
  status,
  environment = "STAGING", 
  timestamp,
  className = ""
}: {
  pipelineName: string;
  status: PipelineStatus;
  environment?: string;
  timestamp?: string;
  className?: string;
}) => {
  const isFailure = status === "FAILED";
  
  return (
    <div className={`p-4 border rounded-lg ${isFailure ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'} ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isFailure ? 'bg-red-500' : 'bg-blue-500'}`} />
          <span className="font-medium">Pipeline: {pipelineName}</span>
        </div>
        <PipelineStatusBadge status={status} />
      </div>
      
      <div className="text-sm text-gray-600 mb-1">
        Pipeline execution {status}
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Environment: {environment}</span>
        {timestamp && <span>{timestamp}</span>}
      </div>
    </div>
  );
}; 
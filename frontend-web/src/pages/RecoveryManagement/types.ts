export interface RecoveryRequest {
  id: string;
  recoveryScope: "full" | "latest" | "time-based";
  fileCount: number;
  requestTime: Date;
  status: "pending" | "in-progress" | "completed" | "failed";
  progress?: number;
  estimatedTime?: string;
  errorLog?: string;
}

export interface RecoveryManagementDetailsProps {
  item: RecoveryRequest;
  onClose: () => void;
  hideViewDetails?: boolean;
}

import colors from "tailwindcss/colors";

interface StorageData {
  total: number;
  used: number;
  remaining: number;
  general: number;
  critical: number;
}

interface Notification {
  id: number;
  type: string;
  message: string;
  date: string;
  time: string;
  requester: string;
  result: string;
}

interface QuickStat {
  title: string;
  value: string;
  change: string;
  increasing: boolean;
}

interface PieChartData {
  name: string;
  value: number;
  displayValue: string;
  color: string;
}

export const storageData: StorageData = {
  total: 2048,
  used: 1280,
  remaining: 768 / 1024,
  general: 768 / 1024,
  critical: 512 / 1024,
};

export const notifications: Notification[] = [
  {
    id: 4,
    type: "success",
    message: "Integrity verification cycle completed for all critical data",
    date: "2024-03-19",
    time: "11:00 AM",
    requester: "Integrity Verification Service",
    result: "Completed",
  },
  {
    id: 6,
    type: "success",
    message: "Backup verification completed successfully",
    date: "2024-03-19",
    time: "10:30 AM",
    requester: "Backup Verification Service",
    result: "Completed",
  },
  {
    id: 7,
    type: "success",
    message: "System health check passed all diagnostics",
    date: "2024-03-19",
    time: "09:45 AM",
    requester: "System Health Monitor",
    result: "Completed",
  },
  {
    id: 5,
    type: "info",
    message: "Daily backup summary: 1.2TB processed, 99.9% success rate",
    date: "2024-03-19",
    time: "06:00 AM",
    requester: "Backup Service",
    result: "Completed",
  },
  {
    id: 1,
    type: "error",
    message: "Mass file modifications detected - Potential ransomware activity",
    date: "2024-03-19",
    time: "14:23 PM",
    requester: "Ransomware Detection System",
    result: "Urgent",
  },
  {
    id: 2,
    type: "warning",
    message: "Data integrity verification failed for /backup/financial/Q4",
    date: "2024-03-19",
    time: "13:45 PM",
    requester: "Integrity Verification Service",
    result: "Pending",
  },
  {
    id: 3,
    type: "error",
    message: "IPFS Node #5 disconnected - Redundancy compromised",
    date: "2024-03-19",
    time: "12:30 PM",
    requester: "Network Monitor",
    result: "Unresolved",
  },
];

export const quickStats: QuickStat[] = [
  {
    title: "Total Files",
    value: "24,892",
    change: "+12%",
    increasing: true,
  },
  {
    title: "Storage Used",
    value: "63%",
    change: "+5%",
    increasing: true,
  },
  {
    title: "Backup Success Rate",
    value: "98.2%",
    change: "-0.3%",
    increasing: false,
  },
  {
    title: "Critical Alerts",
    value: "3",
    change: "+2",
    increasing: true,
  },
];

export const pieChartData: PieChartData[] = [
  {
    name: "Available Space",
    value: 768,
    displayValue: "768 MB",
    color: colors.gray[200],
  },
  {
    name: "Critical Data",
    value: 512,
    displayValue: "512 MB",
    color: colors.red[500],
  },
  {
    name: "General Data",
    value: 640,
    displayValue: "640 MB",
    color: colors.green[500],
  },
  {
    name: "Other Data",
    value: 128,
    displayValue: "128 MB",
    color: colors.gray[500],
  },
];

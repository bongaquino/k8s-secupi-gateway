import { useState } from "react";
import colors from "tailwindcss/colors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Bell, Search, CheckCircle, Activity } from "lucide-react";
import { PieChart } from "@/components/ui/pie-chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatDetailDate } from "@/utils/formatDetailDate";

// Types
type NotificationType = "integrity" | "ransomware" | "network";
type MeasureStatus = "in_action" | "completed" | "backup_completed";
type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  targetFile: string;
  timestamp: Date;
  status: MeasureStatus;
};

const Notifications = () => {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);

  // Mock data - Replace with actual data from your backend
  const notifications: Notification[] = [
    {
      id: "1",
      type: "integrity",
      title: "Integrity Check Warning",
      message:
        "File integrity verification failed for system.log. Possible unauthorized modification detected.",
      targetFile: "System Files > Logs > system.log",
      timestamp: new Date(),
      status: "in_action",
    },
    {
      id: "2",
      type: "ransomware",
      title: "Ransomware Activity Detected",
      message:
        "Suspicious encryption activity detected in user documents folder. Action taken: Process terminated.",
      targetFile: "User Documents > Reports",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      status: "completed",
    },
    {
      id: "3",
      type: "network",
      title: "Recovery Success",
      message:
        "Successfully recovered 15 files from backup. All files verified and restored.",
      targetFile: "Backups > March 2024",
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      status: "backup_completed",
    },
  ];

  // Warning statistics data
  const warningTypeData = [
    {
      name: "Integrity",
      value: 15,
      color: colors.blue[500],
    },
    {
      name: "Ransomware",
      value: 5,
      color: colors.red[500],
    },
    {
      name: "Network",
      value: 8,
      color: colors.green[500],
    },
    {
      name: "Others",
      value: 3,
      color: colors.gray[500],
    },
  ];

  // Enhanced monthly warnings data with type breakdown
  const monthlyWarningsData = [
    {
      month: "Jan",
      Integrity: 2,
      Ransomware: 1,
      Network: 1,
      Others: 0,
      total: 4,
    },
    {
      month: "Feb",
      Integrity: 3,
      Ransomware: 1,
      Network: 2,
      Others: 0,
      total: 6,
    },
    {
      month: "Mar",
      Integrity: 4,
      Ransomware: 2,
      Network: 1,
      Others: 1,
      total: 8,
    },
    {
      month: "Apr",
      Integrity: 1,
      Ransomware: 0,
      Network: 2,
      Others: 0,
      total: 3,
    },
    {
      month: "May",
      Integrity: 2,
      Ransomware: 1,
      Network: 1,
      Others: 1,
      total: 5,
    },
    {
      month: "Jun",
      Integrity: 3,
      Ransomware: 2,
      Network: 2,
      Others: 0,
      total: 7,
    },
    {
      month: "Jul",
      Integrity: 2,
      Ransomware: 1,
      Network: 1,
      Others: 0,
      total: 4,
    },
    {
      month: "Aug",
      Integrity: 4,
      Ransomware: 2,
      Network: 2,
      Others: 1,
      total: 9,
    },
    {
      month: "Sep",
      Integrity: 2,
      Ransomware: 1,
      Network: 2,
      Others: 0,
      total: 5,
    },
    {
      month: "Oct",
      Integrity: 3,
      Ransomware: 1,
      Network: 1,
      Others: 1,
      total: 6,
    },
    {
      month: "Nov",
      Integrity: 2,
      Ransomware: 0,
      Network: 2,
      Others: 0,
      total: 4,
    },
    {
      month: "Dec",
      Integrity: 3,
      Ransomware: 2,
      Network: 1,
      Others: 1,
      total: 7,
    },
  ];

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.targetFile.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType =
      selectedType === "all" || notification.type === selectedType;

    const notificationDate = new Date(notification.timestamp);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const matchesDateRange =
      (!start || notificationDate >= start) &&
      (!end || notificationDate <= end);

    return matchesSearch && matchesType && matchesDateRange;
  });

  // Get notification type badge
  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case "integrity":
        return <Badge variant="outline">Integrity</Badge>;
      case "ransomware":
        return <Badge variant="destructive">Ransomware</Badge>;
      case "network":
        return <Badge variant="secondary">Network</Badge>;
    }
  };

  // Get measure status badge
  const getMeasureStatusBadge = (status: MeasureStatus) => {
    switch (status) {
      case "in_action":
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <Activity className="h-4 w-4" />
            <span>In Action</span>
          </div>
        );
      case "completed":
        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Completion of Measures</span>
          </div>
        );
      case "backup_completed":
        return (
          <div className="flex items-center gap-2 text-purple-600">
            <CheckCircle className="h-4 w-4" />
            <span>Backup Completion</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notifications</h1>
      </div>

      {/* Search & Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2">
            <div className="relative w-1/3">
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full"
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground text-sm" />
            </div>
            <div className="flex gap-8">
              <div className="flex items-center gap-2">
                <p>Warning Type:</p>
                <Select
                  value={selectedType}
                  onValueChange={(value) => setSelectedType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Warning Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="integrity">Integrity</SelectItem>
                    <SelectItem value="ransomware">Ransomware</SelectItem>
                    <SelectItem value="network">Network</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <p>Date Range:</p>

                <div className="flex items-center gap-2 col-span-2">
                  <div>
                    <div className="relative">
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="cursor-pointer"
                        onClick={(e) => {
                          const input = e.target as HTMLInputElement;
                          input.showPicker();
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-muted-foreground text-sm self-end mb-2">
                    -
                  </span>

                  <div className="relative">
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="cursor-pointer"
                      onClick={(e) => {
                        const input = e.target as HTMLInputElement;
                        input.showPicker();
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Notification History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time Occurred</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Target File</TableHead>
                <TableHead>Measure</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.map((notification) => (
                <TableRow
                  key={notification.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedNotification(notification)}
                >
                  <TableCell>
                    {formatDetailDate(notification.timestamp.toISOString())}
                  </TableCell>
                  <TableCell>{getTypeBadge(notification.type)}</TableCell>
                  <TableCell>{notification.title}</TableCell>
                  <TableCell>{notification.targetFile}</TableCell>
                  <TableCell>
                    {getMeasureStatusBadge(notification.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Statistics Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Warning Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Warning Types Distribution */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-lg font-medium mb-6 text-center">
                Warning Type Distribution
              </h3>
              <div className="flex items-center gap-6 justify-center mt-10">
                <div className="relative h-64 w-64">
                  <PieChart data={warningTypeData} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center rounded-full">
                      <div className="text-2xl font-bold">
                        {warningTypeData.reduce(
                          (sum, item) => sum + item.value,
                          0
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Total Warnings
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4  p-4 rounded-lg">
                  {warningTypeData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Warnings Chart */}
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-lg font-medium mb-6 text-center">
                Monthly Warning Distribution
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyWarningsData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      label={{
                        value: "Month",
                        position: "insideBottom",
                        offset: -10,
                      }}
                    />
                    <YAxis
                      label={{
                        value: "Number of Warnings",
                        angle: -90,
                        position: "insideLeft",
                        offset: 0,
                      }}
                    />
                    <Tooltip
                      formatter={(value, name) => [`${value} warnings`, name]}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Legend verticalAlign="top" height={36} />
                    <Bar
                      dataKey="Integrity"
                      stackId="a"
                      fill={colors.blue[500]}
                      name="Integrity"
                    />
                    <Bar
                      dataKey="Ransomware"
                      stackId="a"
                      fill={colors.red[500]}
                      name="Ransomware"
                    />
                    <Bar
                      dataKey="Network"
                      stackId="a"
                      fill={colors.green[500]}
                      name="Network"
                    />
                    <Bar
                      dataKey="Others"
                      stackId="a"
                      fill={colors.gray[500]}
                      name="Others"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedNotification}
        onOpenChange={() => setSelectedNotification(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
          </DialogHeader>
          {selectedNotification && (
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <h3 className="font-medium">Type</h3>
                <p>{getTypeBadge(selectedNotification.type)}</p>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-medium">Time</h3>
                <p className="text-muted-foreground text-sm text-sm">
                  {formatDetailDate(
                    selectedNotification.timestamp.toISOString()
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-medium">Measure Status</h3>
                <p className=" text-sm">
                  {getMeasureStatusBadge(selectedNotification.status)}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-medium">Title</h3>
                <p className="text-muted-foreground text-sm">
                  {selectedNotification.title}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-medium">Message</h3>
                <div className="p-4 bg-secondary/50 rounded-md">
                  <p className="text-muted-foreground text-sm">
                    {selectedNotification.message}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-medium">Target File</h3>
                <p className="text-muted-foreground text-sm">
                  {selectedNotification.targetFile}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notifications;

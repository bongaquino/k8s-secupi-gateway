import { useState } from "react";
import {
  Settings,
  FileText,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  FileArchive,
  RotateCcw,
  Bell,
  BellRingIcon,
} from "lucide-react";
import {
  storageData,
  notifications,
  quickStats,
  pieChartData,
} from "./mockdata";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { PieChart } from "@/components/ui/pie-chart";
import { formatStorage } from "@/utils/formatStorage";

const Dashboard = () => {
  const [hasNotifications] = useState(notifications.length > 0);
  const usedPercentage = (storageData.used / storageData.total) * 100;

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="px-6 py-2">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  <div
                    className={`flex items-center mt-1 ${
                      stat.title === "Critical Alerts"
                        ? stat.increasing
                          ? "text-red-600"
                          : "text-green-600"
                        : stat.increasing
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.increasing ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    <span className="text-xs font-medium">
                      {stat.change} from last month
                    </span>
                  </div>
                </div>
                <div className="p-2 rounded-full bg-gray-50">
                  {stat.title === "Total Files" && (
                    <FileText className="h-6 w-6 text-blue-500" />
                  )}
                  {stat.title === "Storage Used" && (
                    <HardDrive className="h-6 w-6 text-purple-500" />
                  )}
                  {stat.title === "Backup Success Rate" && (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  )}
                  {stat.title === "Critical Alerts" && (
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="md:col-span-2 lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center">
              <HardDrive className="h-5 w-5 mr-2 text-blue-600" />
              Storage Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="relative h-60 w-60 mb-8 rounded-lg">
                <PieChart data={pieChartData} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center bg-white bg-opacity-90 rounded-full p-4">
                    <div className="text-2xl font-bold">
                      {formatStorage(storageData.used)}
                    </div>
                    <div className="text-sm text-gray-500">Used Space</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6">
                {pieChartData.map((item) => (
                  <div key={item.name} className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600 mr-2">
                      {item.name}
                    </span>
                    <span className="text-sm font-medium">
                      {item.displayValue}
                    </span>
                  </div>
                ))}
              </div>

              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Overall Capacity</span>
                  <span className="text-gray-600">{storageData.total} GB</span>
                </div>
                <Progress value={usedPercentage < 1 ? 0.5 : usedPercentage} />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Usage: {formatStorage(storageData.used)}</span>
                  <span>Remaining: {formatStorage(storageData.remaining)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col gap-4 ">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium flex items-center">
                <Bell className="h-5 w-5 mr-2 text-blue-600" />
                Recent Notifications
              </CardTitle>
            </div>
          </CardHeader>
          {!hasNotifications ? (
            <CardContent className="flex-1 overflow-y-auto  ">
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-1 -mt-4">
                <BellRingIcon className="h-8 w-8 text-gray-500" />
                <h2 className="text-lg">No notifications yet</h2>
                <p className="text-center">
                  Notifications about your activity will show up here.
                </p>
              </div>
            </CardContent>
          ) : (
            <CardContent className="flex-1 overflow-y-auto max-h-[420px]">
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          notification.type === "success"
                            ? "bg-green-100 text-green-600"
                            : notification.type === "info"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {notification.type === "success" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : notification.type === "info" ? (
                          <FileText className="h-4 w-4" />
                        ) : (
                          <AlertTriangle className="h-4 w-4" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {notification.date} at {notification.time} •{" "}
                          {notification.requester}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        notification.result === "Completed"
                          ? "bg-green-100 text-green-700"
                          : notification.result === "Available"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {notification.result}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer transition-all hover:shadow-sm">
          <CardContent className="p-6">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-center text-blue-700 hover:bg-blue-200/50 pointer-events-none"
            >
              <FileArchive className="mr-2 h-5 w-5" />
              <span className="font-medium">Backup File Explorer</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br cursor-pointer from-purple-50 to-purple-100 border-purple-200  transition-all hover:shadow-sm ">
          <CardContent className="p-6">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-center text-purple-700 hover:bg-purple-200/50 pointer-events-none"
            >
              <RotateCcw className="mr-2 h-5 w-5" />
              <span className="font-medium">Recovery Request Center</span>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 cursor-pointer transition-all hover:shadow-sm">
          <CardContent className="p-6">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-center text-gray-700 hover:bg-gray-200/50 pointer-events-none"
            >
              <Settings className="mr-2 h-5 w-5" />
              <span className="font-medium">Settings</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

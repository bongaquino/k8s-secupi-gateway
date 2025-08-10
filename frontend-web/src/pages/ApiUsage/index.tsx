import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import * as RechartsPrimitive from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { PieChart } from "@/components/ui/pie-chart";
import {
  FolderTree,
  Upload,
  Download,
  FileText,
  Pencil,
  Trash,
  FolderPlus,
  FolderEdit,
  FolderX,
  HardDrive,
  Folder,
} from "lucide-react";

const ApiUsage = () => {
  const usageData = {
    totalRequests: {
      files: 183,
      directories: 62,
    },
    usedStorage: 834,
    apiKeys: [
      {
        id: "1",
        name: "Production Key",
        lastUsed: "May 18, 2025, 06:57 PM",
      },
      {
        id: "2",
        name: "Development Key",
        lastUsed: "May 20, 2025, 06:57 PM",
      },
      {
        id: "3",
        name: "Testing Key",
        lastUsed: "May 13, 2025, 06:57 PM",
      },
    ],
    fileOperations: [
      { name: "Upload", value: 42, icon: Upload },
      { name: "Download", value: 89, icon: Download },
      { name: "Read", value: 35, icon: FileText },
      { name: "Edit", value: 12, icon: Pencil },
      { name: "Delete", value: 5, icon: Trash },
    ],
    directoryOperations: [
      { name: "Create", value: 10, icon: FolderPlus },
      { name: "Read", value: 15, icon: FolderTree },
      { name: "Edit", value: 8, icon: FolderEdit },
      { name: "Delete", value: 4, icon: FolderX },
    ],
    // Daily requests over time
    dailyRequests: [
      { day: "Mon", files: 23, directories: 8 },
      { day: "Tue", files: 35, directories: 12 },
      { day: "Wed", files: 18, directories: 7 },
      { day: "Thu", files: 42, directories: 16 },
      { day: "Fri", files: 31, directories: 11 },
      { day: "Sat", files: 19, directories: 5 },
      { day: "Sun", files: 15, directories: 3 },
    ],
    // Usage by API key
    keyUsage: {
      "Production Key": { files: 103, directories: 37, total: 140 },
      "Development Key": { files: 58, directories: 20, total: 78 },
      "Testing Key": { files: 22, directories: 5, total: 27 },
    },
  };

  // State for selected API key
  const [selectedKey, setSelectedKey] = useState("all");

  // Helper for getting filtered data based on selected key
  const getFilteredData = () => {
    if (selectedKey === "all") {
      return {
        files: usageData.totalRequests.files,
        directories: usageData.totalRequests.directories,
        fileBreakdown: usageData.fileOperations,
        dirBreakdown: usageData.directoryOperations,
      };
    }

    const keyName =
      usageData.apiKeys.find((k) => k.id === selectedKey)?.name || "";
    const keyData = usageData.keyUsage[
      keyName as keyof typeof usageData.keyUsage
    ] || { files: 0, directories: 0 };

    // Scale down the breakdown data proportionally for the selected key
    const fileScale = keyData.files / usageData.totalRequests.files;
    const dirScale = keyData.directories / usageData.totalRequests.directories;

    return {
      files: keyData.files,
      directories: keyData.directories,
      fileBreakdown: usageData.fileOperations.map((op) => ({
        ...op,
        value: Math.round(op.value * fileScale),
      })),
      dirBreakdown: usageData.directoryOperations.map((op) => ({
        ...op,
        value: Math.round(op.value * dirScale),
      })),
    };
  };

  const filteredData = getFilteredData();

  const chartConfig = {
    files: {
      label: "Files",
      theme: {
        light: "#2563eb",
        dark: "#3b82f6",
      },
    },
    directories: {
      label: "Directories",
      theme: {
        light: "#16a34a",
        dark: "#22c55e",
      },
    },
  };

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Usage</h1>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedKey} onValueChange={setSelectedKey}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by API Key" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All API Keys</SelectItem>
              {usageData.apiKeys.map((key) => (
                <SelectItem key={key.id} value={key.id}>
                  {key.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Storage Card */}
        <Card className="relative overflow-visible">
          <CardContent className="px-6 mt-2 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground font-medium mb-2">
                  Storage Usage
                </div>
                <div className="text-2xl font-bold">
                  {usageData.usedStorage} MB
                </div>
              </div>
              <div className="p-2 rounded-full bg-gray-50">
                <HardDrive className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Requests Card */}
        <Card className="relative overflow-visible">
          <CardContent className="px-6 mt-2 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground font-medium mb-2">
                  File API Requests
                </div>
                <div className="text-2xl font-bold">{filteredData.files}</div>
              </div>
              <div className="p-2 rounded-full bg-gray-50">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Directory Requests Card */}
        <Card className="relative overflow-visible">
          <CardContent className="px-6 mt-2 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground font-medium mb-2">
                  Directory API Requests
                </div>
                <div className="text-2xl font-bold">
                  {filteredData.directories}
                </div>
              </div>
              <div className="p-2 rounded-full bg-gray-50">
                <Folder className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="py-2 px-1.5">
          <TabsTrigger value="overview" className="py-3 rounded-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="files" className="py-3 rounded-sm">
            File Operations
          </TabsTrigger>
          <TabsTrigger value="directories" className="py-3 rounded-sm">
            Directory Operations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  API Requests Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="my-auto">
                <div className="bg-card rounded-lg p-0 ">
                  <div className="flex items-center gap-6 justify-center">
                    <div className="relative h-64 w-64">
                      <PieChart
                        data={[
                          {
                            name: "Production Key",
                            value: usageData.keyUsage["Production Key"].total,
                            color: "#3b82f6",
                          },
                          {
                            name: "Development Key",
                            value: usageData.keyUsage["Development Key"].total,
                            color: "#22c55e",
                          },
                          {
                            name: "Testing Key",
                            value: usageData.keyUsage["Testing Key"].total,
                            color: "#f59e0b",
                          },
                        ]}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center rounded-full">
                          <div className="text-2xl font-bold">245</div>
                          <div className="text-sm text-gray-500">
                            Total Requests
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4 p-4 rounded-lg">
                      {Object.entries(usageData.keyUsage).map(
                        ([key, value], index) => (
                          <div
                            key={key}
                            className="flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    index === 0
                                      ? "#3b82f6"
                                      : index === 1
                                      ? "#22c55e"
                                      : "#f59e0b",
                                }}
                              />
                              <span className="text-sm font-medium">{key}</span>
                            </div>
                            <span className="text-sm font-semibold">
                              {value.total}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">
                  Daily API Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2">
                <div className="w-full pt-4">
                  <ChartContainer config={chartConfig}>
                    <RechartsPrimitive.BarChart data={usageData.dailyRequests}>
                      <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                      <RechartsPrimitive.XAxis dataKey="day" />
                      <RechartsPrimitive.YAxis />
                      <RechartsPrimitive.Tooltip />
                      <RechartsPrimitive.Legend
                        wrapperStyle={{ paddingTop: "20px" }}
                      />
                      <RechartsPrimitive.Bar
                        dataKey="files"
                        name="Files"
                        fill="var(--color-files)"
                      />
                      <RechartsPrimitive.Bar
                        dataKey="directories"
                        name="Directories"
                        fill="var(--color-directories)"
                      />
                    </RechartsPrimitive.BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Active API Keys
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {usageData.apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div className="font-medium">{key.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Last used: {key.lastUsed}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                File Operations Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2">
              <div className="w-full pt-4">
                <ChartContainer config={chartConfig}>
                  <RechartsPrimitive.BarChart
                    data={filteredData.fileBreakdown}
                    layout="vertical"
                  >
                    <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                    <RechartsPrimitive.XAxis type="number" />
                    <RechartsPrimitive.YAxis
                      type="category"
                      dataKey="name"
                      width={70}
                    />
                    <RechartsPrimitive.Tooltip />
                    <RechartsPrimitive.Legend
                      wrapperStyle={{ paddingTop: "10px" }}
                    />
                    <RechartsPrimitive.Bar
                      dataKey="value"
                      name="Requests"
                      fill="var(--color-files)"
                    />
                  </RechartsPrimitive.BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                File Operations Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {filteredData.fileBreakdown.map((op) => {
                  const Icon = op.icon;
                  return (
                    <div
                      key={op.name}
                      className="space-y-2 p-4 rounded-lg border bg-card text-card-foreground "
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-muted-foreground">
                          {op.name}
                        </div>
                        <Icon className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="text-2xl font-bold">{op.value}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="directories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Directory Operations Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full pt-4">
                <ChartContainer config={chartConfig}>
                  <RechartsPrimitive.BarChart
                    data={filteredData.dirBreakdown}
                    layout="vertical"
                  >
                    <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" />
                    <RechartsPrimitive.XAxis type="number" />
                    <RechartsPrimitive.YAxis
                      type="category"
                      dataKey="name"
                      width={70}
                    />
                    <RechartsPrimitive.Tooltip />
                    <RechartsPrimitive.Legend
                      wrapperStyle={{ paddingTop: "10px" }}
                    />
                    <RechartsPrimitive.Bar
                      dataKey="value"
                      name="Requests"
                      fill="var(--color-directories)"
                    />
                  </RechartsPrimitive.BarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Directory Operations Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filteredData.dirBreakdown.map((op) => {
                  const Icon = op.icon;
                  return (
                    <div
                      key={op.name}
                      className="space-y-2 p-4 rounded-lg border bg-card text-card-foreground"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-muted-foreground">
                          {op.name}
                        </div>
                        <Icon className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="text-2xl font-bold">{op.value}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiUsage;

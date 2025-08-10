import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  MoreVertical,
  RotateCcw,
  FilePlus,
  Download,
  X,
} from "lucide-react";
import { getStatusBadge } from "./StatusBadge";
import type { RecoveryRequest } from "./types";
import { formatDetailDate } from "@/utils/formatDetailDate";
import RequestRecovery from "./RecoveryRequest";

const RecoveryManagement = () => {
  const [selectedItem, setSelectedItem] = useState<RecoveryRequest | null>(
    null
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [requests] = useState<RecoveryRequest[]>([
    {
      id: "REC-01",
      recoveryScope: "full",
      fileCount: 156,
      requestTime: new Date(),
      status: "pending",
    },
    {
      id: "REC-02",
      recoveryScope: "latest",
      fileCount: 89,
      requestTime: new Date(Date.now()),
      status: "in-progress",
      progress: 45,
    },
    {
      id: "REC-03",
      recoveryScope: "time-based",
      fileCount: 234,
      requestTime: new Date(Date.now()),
      status: "completed",
    },
    {
      id: "REC-04",
      recoveryScope: "latest",
      fileCount: 67,
      requestTime: new Date(Date.now()),
      status: "failed",
      errorLog: "Network connection lost during recovery process",
    },
  ]);

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Recovery Requests
        </h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <FilePlus className="h-4 w-4" />
          Create Request
        </Button>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className={`col-span-12 bg-white rounded-xl border max-h-fit`}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[18%]">
                  <div className="ml-2">Request ID</div>
                </TableHead>
                <TableHead className="w-[16%]">Recovery Scope</TableHead>
                <TableHead className="w-[15%]">File Count</TableHead>
                <TableHead className="w-[20%]">Status</TableHead>
                <TableHead className="w-[20%]">Request Date</TableHead>

                <TableHead className="w-[5%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow
                  key={request.id}
                  className={`cursor-pointer ${
                    selectedItem?.id === request.id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => {
                    if (selectedItem?.id === request.id) {
                      setSelectedItem(null);
                    } else {
                      setSelectedItem(request);
                    }
                  }}
                >
                  <TableCell>
                    <div className="flex gap-3 items-center">
                      <div className="ml-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <span>{request.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {request.recoveryScope === "full"
                      ? "Full Recovery"
                      : request.recoveryScope === "latest"
                      ? "Latest Version"
                      : "Point in Time"}
                  </TableCell>
                  <TableCell>{request.fileCount} files</TableCell>
                  <TableCell>
                    {request.status === "in-progress" ? (
                      <div className="w-[50%]">
                        <Progress
                          value={request.progress}
                          className="h-2"
                          animated
                        />
                      </div>
                    ) : (
                      getStatusBadge(request.status)
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDetailDate(request.requestTime.toISOString())}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 ml-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {request.status === "completed" && (
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 text-inherit" />
                            Download
                          </DropdownMenuItem>
                        )}
                        {request.status === "failed" && (
                          <DropdownMenuItem>
                            <RotateCcw className="h-4 w-4 text-inherit" />
                            Retry Request
                          </DropdownMenuItem>
                        )}
                        {request.status === "pending" && (
                          <DropdownMenuItem disabled>
                            <Download className="h-4 w-4 text-inherit" />
                            Download
                          </DropdownMenuItem>
                        )}
                        {request.status === "in-progress" && (
                          <DropdownMenuItem>
                            <X className="h-4 w-4 text-inherit" />
                            Cancel Request
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Recovery Request</DialogTitle>
          </DialogHeader>
          <div className="py-1">
            <RequestRecovery
              onSubmit={(data) => {
                // Handle the form submission
                console.log("Recovery request data:", data);
                // TODO: Implement the actual recovery request creation
                setIsCreateDialogOpen(false);
              }}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecoveryManagement;

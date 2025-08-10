import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useReadDirectory, useUpdateDirectory } from "@/hooks/useDirectories";
import type { Directory } from "@/api/types/directories.types";
import { toast } from "sonner";
import { ItemIcon } from "./itemIcon";
import { directoryToFileItem } from "./types";

interface MoveDialogProps {
  directory: Directory;
  isOpen: boolean;
  onClose: () => void;
  currentParentId?: string;
}

interface BreadcrumbItem {
  id: string;
  name: string;
}

export default function MoveDialog({
  directory,
  isOpen,
  onClose,
  currentParentId,
}: MoveDialogProps) {
  const [currentDirectoryId, setCurrentDirectoryId] = useState("root");
  const [selectedDirectory, setSelectedDirectory] = useState<Directory | null>(
    null
  );
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: "root", name: "Root" },
  ]);

  const {
    data: directoryData,
    isLoading,
    error,
  } = useReadDirectory(currentDirectoryId);

  const updateDirectoryMutation = useUpdateDirectory();

  const handleDirectoryClick = (targetDirectory: Directory) => {
    if (selectedDirectory?.id === targetDirectory.id) {
      setCurrentDirectoryId(targetDirectory.id);
      setBreadcrumbs((prev) => [
        ...prev,
        { id: targetDirectory.id, name: targetDirectory.name },
      ]);
      setSelectedDirectory(null);
    } else {
      setSelectedDirectory(targetDirectory);
    }
  };

  const handleNavigateClick = (
    targetDirectory: Directory,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setCurrentDirectoryId(targetDirectory.id);
    setBreadcrumbs((prev) => [
      ...prev,
      { id: targetDirectory.id, name: targetDirectory.name },
    ]);
    setSelectedDirectory(null);
  };

  const handleBreadcrumbClick = (index: number) => {
    const targetBreadcrumb = breadcrumbs[index];
    setCurrentDirectoryId(targetBreadcrumb.id);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    setSelectedDirectory(null);
  };

  const getTargetDirectoryId = () => {
    if (selectedDirectory) {
      return selectedDirectory.id;
    }
    return directoryData?.directory?.id || currentDirectoryId;
  };

  const canMoveHere = (() => {
    const targetDirId = getTargetDirectoryId();

    // Can't move to itself
    if (targetDirId === directory.id) return false;

    // Can't move to current parent directory (no point in moving)
    if (targetDirId === currentParentId) return false;

    return true;
  })();

  const handleMove = async () => {
    const targetDirectoryId = getTargetDirectoryId();

    if (!canMoveHere) {
      toast.error("Cannot move directory to this location");
      return;
    }

    try {
      await updateDirectoryMutation.mutateAsync({
        directory: directory.id,
        data: {
          directory_id: targetDirectoryId,
          name: directory.name,
        },
      });

      toast.success(`Moved "${directory.name}" successfully`);
      onClose();
    } catch (error) {
      toast.error("Failed to move directory");
      console.error("Error moving directory:", error);
    }
  };

  const renderBreadcrumbs = () => {
    // On mobile, show only the last 2-3 breadcrumbs to save space
    const displayBreadcrumbs =
      breadcrumbs.length > 3
        ? [
            breadcrumbs[0],
            { id: "ellipsis", name: "..." },
            ...breadcrumbs.slice(-2),
          ]
        : breadcrumbs;

    return (
      <div className="flex items-center gap-1 mb-4 text-muted-foreground overflow-x-auto">
        {displayBreadcrumbs.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex items-center shrink-0"
          >
            {index > 0 && (
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mx-1 shrink-0" />
            )}
            {item.id === "ellipsis" ? (
              <span className="text-muted-foreground text-sm px-1">...</span>
            ) : (
              <button
                onClick={() => {
                  const realIndex = breadcrumbs.findIndex(
                    (b) => b.id === item.id
                  );
                  if (realIndex !== -1) {
                    handleBreadcrumbClick(realIndex);
                  }
                }}
                className="text-blue-600 cursor-pointer hover:underline truncate max-w-[80px] sm:max-w-[150px] "
              >
                {item.name}
              </button>
            )}
          </div>
        ))}
        {selectedDirectory && (
          <>
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 mx-1 shrink-0" />
            <span className="text-primary truncate max-w-[80px] sm:max-w-[150px]">
              {selectedDirectory.name}
            </span>
          </>
        )}
      </div>
    );
  };

  const availableDirectories =
    directoryData?.subdirectories?.filter((dir) => dir.id !== directory.id) ||
    [];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-xl max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-base sm:text-lg truncate pr-8">
            Move "<span className="font-medium">{directory.name}</span>"
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col justify-center sm:flex-row sm:gap-2 mt-2 text-sm sm:text-base flex-shrink-0">
          <span className="text-muted-foreground whitespace-nowrap">
            Moving to:
          </span>
          <div className="flex-1 min-w-0">{renderBreadcrumbs()}</div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4 text-sm">
              Error loading directories: {error.message}
            </div>
          ) : availableDirectories.length === 0 ? (
            <div className="flex justify-center items-center py-8 bg-gray-50 rounded-lg">
              <div className="text-muted-foreground text-sm text-center px-4">
                No available folders at this level
              </div>
            </div>
          ) : (
            <div className="h-full max-h-[300px] sm:max-h-[400px] space-y-1 overflow-y-auto">
              {availableDirectories.map((dir) => (
                <div
                  key={dir.id}
                  className={`w-full justify-between flex items-center cursor-pointer py-2 sm:py-3 px-3 sm:px-4 rounded-lg hover:bg-accent transition-colors border ${
                    selectedDirectory?.id === dir.id
                      ? "bg-accent text-accent-foreground"
                      : ""
                  }`}
                  onClick={() => handleDirectoryClick(dir)}
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <ItemIcon item={directoryToFileItem(dir)} />
                    <span className="text-sm sm:text-base text-left truncate">
                      {dir.name}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-2 p-1 rounded-sm hover:bg-gray-200 transition-colors z-10 flex-shrink-0"
                    onClick={(e) => handleNavigateClick(dir, e)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleMove}
              disabled={!canMoveHere || updateDirectoryMutation.isPending}
              className="flex-1"
            >
              {updateDirectoryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Moving...
                </>
              ) : (
                "Move"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

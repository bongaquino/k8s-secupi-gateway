import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateDirectory } from "@/hooks/useDirectories";
import type { Directory } from "@/api/types/directories.types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface RenameItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  directory: Directory | null;
  onSuccess: () => void;
  parentDirectoryId?: string;
}

const RenameItemDialog = ({
  isOpen,
  onClose,
  directory,
  onSuccess,
  parentDirectoryId,
}: RenameItemDialogProps) => {
  const [newName, setNewName] = useState("");
  const updateDirectoryMutation = useUpdateDirectory();

  // Set the current directory name when dialog opens
  useEffect(() => {
    if (directory && isOpen) {
      setNewName(directory.name);
    }
  }, [directory, isOpen]);

  const handleRename = async () => {
    if (!newName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    if (!directory) {
      toast.error("No directory selected");
      return;
    }

    if (newName.trim() === directory.name) {
      toast.error("Please enter a different name");
      return;
    }

    try {
      await updateDirectoryMutation.mutateAsync({
        directory: directory.id,
        data: {
          name: newName.trim(),
          directory_id: parentDirectoryId,
        },
      });

      toast.success(`Renamed folder to "${newName.trim()}" successfully`);
      onSuccess();
      handleClose();
    } catch (error) {
      toast.error("Failed to rename folder");
      console.error("Error renaming directory:", error);
    }
  };

  const handleClose = () => {
    setNewName("");
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRename();
    } else if (e.key === "Escape") {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Folder</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <Input
            placeholder="Enter new folder name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={updateDirectoryMutation.isPending}
            autoFocus
            className="w-full"
          />
        </div>
        <DialogFooter>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={updateDirectoryMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={
                updateDirectoryMutation.isPending ||
                !newName.trim() ||
                !directory ||
                newName.trim() === directory?.name
              }
              className="flex-1"
            >
              {updateDirectoryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Renaming...
                </>
              ) : (
                "Rename"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RenameItemDialog;

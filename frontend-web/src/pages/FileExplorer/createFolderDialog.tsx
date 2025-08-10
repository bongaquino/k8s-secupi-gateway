import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateDirectory } from "@/hooks/useDirectories";
import type { Directory } from "@/api/types/directories.types";
import { toast } from "sonner";

interface CreateFolderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentDirectory: Directory | null;
}

const CreateFolderDialog = ({
  isOpen,
  onClose,
  currentDirectory,
}: CreateFolderDialogProps) => {
  const [folderName, setFolderName] = useState("");
  const createDirectoryMutation = useCreateDirectory();

  const handleCreateDirectory = async () => {
    if (!folderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }

    if (!currentDirectory) {
      toast.error("Current directory not found");
      return;
    }

    try {
      await createDirectoryMutation.mutateAsync({
        name: folderName,
        directory_id: currentDirectory.id,
      });

      toast.success("Folder created successfully");
      setFolderName("");
      onClose();
    } catch (error) {
      toast.error("Failed to create folder");
      console.error("Error creating directory:", error);
    }
  };

  const handleClose = () => {
    setFolderName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <Input
            placeholder="Enter folder name"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateDirectory();
              }
            }}
            disabled={createDirectoryMutation.isPending}
          />
        </div>
        <DialogFooter>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={createDirectoryMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateDirectory}
              disabled={
                createDirectoryMutation.isPending ||
                !folderName.trim() ||
                !currentDirectory
              }
              className="flex-1"
            >
              {createDirectoryMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderDialog;

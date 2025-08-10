import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteDirectory } from "@/hooks/useDirectories";
import type { Directory } from "@/api/types/directories.types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface DeleteItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  directory: Directory | null;
  onSuccess: () => void;
}

const DeleteItemDialog = ({
  isOpen,
  onClose,
  directory,
  onSuccess,
}: DeleteItemDialogProps) => {
  const deleteDirectoryMutation = useDeleteDirectory();

  const handleDelete = async () => {
    if (!directory) {
      toast.error("No directory selected");
      return;
    }

    if (directory.id === "root") {
      toast.error("Cannot delete root directory");
      return;
    }

    try {
      await deleteDirectoryMutation.mutateAsync(directory.id);

      toast.success(`Folder "${directory.name}" deleted successfully`);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to delete folder");
      console.error("Error deleting directory:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleDelete();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Delete "{directory?.name}"
          </DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground text-sm md:text-base">
          Are you sure you want to delete this directory? This action cannot be
          undone.
        </p>

        <DialogFooter>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={deleteDirectoryMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteDirectoryMutation.isPending || !directory}
              className="flex-1"
            >
              {deleteDirectoryMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteItemDialog;

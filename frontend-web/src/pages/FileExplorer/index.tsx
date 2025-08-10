import {
  Search,
  FolderPlus,
  MoreVertical,
  ArrowUpDown,
  Trash2,
  Edit,
  Upload,
  Copy,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { directoryToFileItem, directoryFileToFileItem } from "./types";
import { ItemIcon } from "./itemIcon";
import { useReadDirectory } from "@/hooks/useDirectories";
import { toast } from "sonner";
import { formatDetailDate } from "@/utils/formatDetailDate";
import type { Directory } from "@/api/types/directories.types";
import type { FileItem, DirectoryBreadcrumb } from "./types";
import CreateFolderDialog from "./createFolderDialog";
import MoveDialog from "./moveItemDialog";
import RenameItemDialog from "./renameItemDialog";
import DeleteItemDialog from "./deleteItemDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FileExplorer = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentDirectoryId, setCurrentDirectoryId] = useState("root");
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] =
    useState(false);

  const [breadcrumbs, setBreadcrumbs] = useState<DirectoryBreadcrumb[]>([
    { id: "root", name: "My Backups" },
  ]);

  const [moveDialogState, setMoveDialogState] = useState<{
    isOpen: boolean;
    directory: Directory | null;
  }>({
    isOpen: false,
    directory: null,
  });
  const [renameDialogState, setRenameDialogState] = useState<{
    isOpen: boolean;
    directory: Directory | null;
  }>({
    isOpen: false,
    directory: null,
  });
  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    directory: Directory | null;
  }>({
    isOpen: false,
    directory: null,
  });

  const {
    data: directoryData,
    isLoading,
    error,
  } = useReadDirectory(currentDirectoryId);

  const items = useMemo(() => {
    if (!directoryData) return [];

    const folders = directoryData.subdirectories.map(directoryToFileItem);
    const fileItems = directoryData.files.map(directoryFileToFileItem);

    return [...folders, ...fileItems];
  }, [directoryData]);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSortIcon = () => {
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const handleItemClick = (item: FileItem) => {
    if (item.type === "folder") {
      setCurrentDirectoryId(item.id);
      setBreadcrumbs((prev) => [...prev, { id: item.id, name: item.name }]);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const targetBreadcrumb = breadcrumbs[index];
    setCurrentDirectoryId(targetBreadcrumb.id);
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const handleMoveDirectory = (item: FileItem) => {
    if (item.type !== "folder") {
      toast.error("Can only move directories at this time");
      return;
    }

    const actualDirectory = directoryData?.subdirectories.find(
      (dir) => dir.id === item.id
    );

    if (actualDirectory) {
      setMoveDialogState({
        isOpen: true,
        directory: actualDirectory,
      });
    }
  };

  const handleRenameDirectory = (item: FileItem) => {
    if (item.type !== "folder") {
      toast.error("Can only rename directories at this time");
      return;
    }

    const actualDirectory = directoryData?.subdirectories.find(
      (dir) => dir.id === item.id
    );

    if (actualDirectory) {
      setRenameDialogState({
        isOpen: true,
        directory: actualDirectory,
      });
    }
  };

  const handleDeleteDirectoryDialog = (item: FileItem) => {
    if (item.type !== "folder") {
      toast.error("Can only delete directories at this time");
      return;
    }

    const actualDirectory = directoryData?.subdirectories.find(
      (dir) => dir.id === item.id
    );

    if (actualDirectory) {
      setDeleteDialogState({
        isOpen: true,
        directory: actualDirectory,
      });
    }
  };

  const handleRenameSuccess = () => {
    // Refresh the current directory data after successful rename
    // This will be handled automatically by React Query's cache invalidation
  };

  const handleDeleteSuccess = () => {
    // If we deleted the current directory, navigate back to parent
    if (
      deleteDialogState.directory?.id === currentDirectoryId &&
      breadcrumbs.length > 1
    ) {
      const parentBreadcrumb = breadcrumbs[breadcrumbs.length - 2];
      setCurrentDirectoryId(parentBreadcrumb.id);
      setBreadcrumbs(breadcrumbs.slice(0, -1));
    }
    // Refresh will be handled automatically by React Query's cache invalidation
  };

  const handleMoveCurrentDirectory = () => {
    if (currentDirectoryId === "root") {
      toast.error("Cannot move root directory");
      return;
    }

    if (directoryData?.directory) {
      setMoveDialogState({
        isOpen: true,
        directory: directoryData.directory,
      });
    }
  };

  const handleRenameCurrentDirectory = () => {
    if (currentDirectoryId === "root") {
      toast.error("Cannot rename root directory");
      return;
    }

    if (directoryData?.directory) {
      setRenameDialogState({
        isOpen: true,
        directory: directoryData.directory,
      });
    }
  };

  const handleDeleteCurrentDirectory = () => {
    if (currentDirectoryId === "root") {
      toast.error("Cannot delete root directory");
      return;
    }

    if (directoryData?.directory) {
      setDeleteDialogState({
        isOpen: true,
        directory: directoryData.directory,
      });
    }
  };

  const isRootDirectory = currentDirectoryId === "root";

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <p className="text-red-600">
            Error loading directory: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => (
            <BreadcrumbItem key={item.id}>
              {index < breadcrumbs.length - 1 ? (
                <>
                  <BreadcrumbLink
                    className="cursor-pointer hover:text-primary"
                    onClick={() => handleBreadcrumbClick(index)}
                  >
                    {item.name}
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </>
              ) : (
                <span className="text-foreground text-sm font-medium">
                  {item.name}
                </span>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Mobile-first responsive header */}
      <div className="space-y-4 md:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
              {breadcrumbs[breadcrumbs.length - 1]?.name || "File Explorer"}
            </h1>

            <div className="flex items-center gap-1 flex-shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const actualDirectoryId =
                          directoryData?.directory?.id || currentDirectoryId;
                        navigator.clipboard.writeText(actualDirectoryId);
                        toast.success("Copied to clipboard");
                      }}
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy ID</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {!isRootDirectory && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-100 -ml-2"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleRenameCurrentDirectory}>
                      <Edit className="mr-2 h-4 w-4 text-primary" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleMoveCurrentDirectory}>
                      <ArrowUpDown className="mr-2 h-4 w-4 text-primary" />
                      Move
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={handleDeleteCurrentDirectory}
                    >
                      <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-72 sm:ml-auto hidden lg:flex">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search files and folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            <Button
              variant="outline"
              className="flex flex-1 items-center gap-2 !border-primary/50 text-xs sm:text-sm"
              onClick={() => setIsCreateFolderDialogOpen(true)}
            >
              <FolderPlus className="h-4 w-4" />
              <span className="">New Folder</span>
            </Button>
            <Button
              className="flex flex-1 items-center gap-2 text-xs sm:text-sm"
              disabled
            >
              <Upload className="h-4 w-4" />
              <span className="">Upload</span>
            </Button>
          </div>
        </div>

        <div className="relative w-full lg:w-72 sm:ml-auto flex lg:hidden">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            <div className="block md:hidden">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 px-4 text-sm md:text-base">
                  {searchQuery
                    ? "No items match your search"
                    : "This directory is empty"}
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleItemClick(item)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <ItemIcon item={item} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                              {item.size && <span>{item.size}</span>}
                              <span>{formatDetailDate(item.modified)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-gray-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(item.id);
                                    toast.success("Copied to clipboard");
                                  }}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy ID</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRenameDirectory(item);
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4 text-primary" />
                                Rename
                              </DropdownMenuItem>
                              {item.type === "folder" && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMoveDirectory(item);
                                  }}
                                >
                                  <ArrowUpDown className="mr-2 h-4 w-4 text-primary" />
                                  Move
                                </DropdownMenuItem>
                              )}
                              {item.type === "folder" && (
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteDirectoryDialog(item);
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[27.5%] cursor-pointer">
                      <div className="ml-2 flex items-center gap-2">
                        Name {getSortIcon()}
                      </div>
                    </TableHead>
                    <TableHead className="w-[12.5%] cursor-pointer hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        Version{getSortIcon()}
                      </div>
                    </TableHead>
                    <TableHead className="w-[15%] cursor-pointer hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        Importance{getSortIcon()}
                      </div>
                    </TableHead>
                    <TableHead className="w-[13.5%] cursor-pointer hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        Status{getSortIcon()}
                      </div>
                    </TableHead>
                    <TableHead className="w-[12.5%] cursor-pointer">
                      <div className="flex items-center gap-2">
                        Size{getSortIcon()}
                      </div>
                    </TableHead>
                    <TableHead className="w-[20%] cursor-pointer">
                      <div className="flex items-center gap-2">
                        Last Modified{getSortIcon()}
                      </div>
                    </TableHead>
                    <TableHead className="w-[10%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-gray-500"
                      >
                        {searchQuery
                          ? "No items match your search"
                          : "This directory is empty"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow
                        key={item.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleItemClick(item)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3 ml-2">
                            <ItemIcon item={item} />
                            <span className="truncate">{item.name}</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-gray-600 hidden lg:table-cell">
                          -
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          -
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          -
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {item.size}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatDetailDate(item.modified)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-gray-100 "
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(item.id);
                                      toast.success("Copied to clipboard");
                                    }}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy ID</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-gray-100 mr-2"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRenameDirectory(item);
                                  }}
                                >
                                  <Edit className="mr-2 h-4 w-4 text-primary" />
                                  Rename
                                </DropdownMenuItem>
                                {item.type === "folder" && (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveDirectory(item);
                                    }}
                                  >
                                    <ArrowUpDown className="mr-2 h-4 w-4 text-primary" />
                                    Move
                                  </DropdownMenuItem>
                                )}
                                {item.type === "folder" && (
                                  <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteDirectoryDialog(item);
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                                    Delete
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      <CreateFolderDialog
        isOpen={isCreateFolderDialogOpen}
        onClose={() => setIsCreateFolderDialogOpen(false)}
        currentDirectory={directoryData?.directory || null}
      />

      {moveDialogState.directory && (
        <MoveDialog
          directory={moveDialogState.directory}
          isOpen={moveDialogState.isOpen}
          onClose={() => setMoveDialogState({ isOpen: false, directory: null })}
          currentParentId={directoryData?.directory?.id}
        />
      )}

      {renameDialogState.directory && (
        <RenameItemDialog
          directory={renameDialogState.directory}
          isOpen={renameDialogState.isOpen}
          onClose={() =>
            setRenameDialogState({ isOpen: false, directory: null })
          }
          onSuccess={handleRenameSuccess}
          parentDirectoryId={directoryData?.directory?.id}
        />
      )}

      {deleteDialogState.directory && (
        <DeleteItemDialog
          directory={deleteDialogState.directory}
          isOpen={deleteDialogState.isOpen}
          onClose={() =>
            setDeleteDialogState({ isOpen: false, directory: null })
          }
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
};

export default FileExplorer;

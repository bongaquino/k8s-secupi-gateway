import type { Directory, DirectoryFile } from "@/api/types/directories.types";

export interface FileItem {
  id: string;
  name: string;
  type: "file" | "folder";
  extension: string | null;
  size: string;
  importance: "high" | "medium" | "low";
  status: "COMPLETED" | "IN_PROGRESS" | "ERROR";
  modified: string;
  created: string;
  path: string;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
  path?: string;
}

export interface DirectoryBreadcrumb {
  id: string;
  name: string;
}

// Helper function to convert Directory to FileItem for display
export const directoryToFileItem = (directory: Directory): FileItem => ({
  id: directory.id,
  name: directory.name,
  type: "folder" as const,
  extension: null,
  size: `${directory.size} items`,
  importance: "medium" as const,
  status: "COMPLETED" as const,
  modified: directory.updatedAt,
  created: directory.createdAt,
  path: `/directories/${directory.id}`,
});

// Helper function to convert DirectoryFile to FileItem for display
export const directoryFileToFileItem = (file: DirectoryFile): FileItem => ({
  id: file.id,
  name: file.name,
  type: "file" as const,
  extension: file.name.split(".").pop() || null,
  size: `${file.size} bytes`,
  importance: "medium" as const,
  status: "COMPLETED" as const,
  modified: file.updatedAt,
  created: file.createdAt,
  path: `/files/${file.id}`,
});

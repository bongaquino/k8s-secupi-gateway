export interface Directory {
  id: string;
  name: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export interface DirectoryFile {
  id: string;
  name: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDirectoryData {
  directory_id?: string;
  name: string;
}

export interface CreateDirectoryResponse {
  directory: Directory;
}

export interface ReadDirectoryResponse {
  directory: Directory;
  files: DirectoryFile[];
  subdirectories: Directory[];
}

export interface UpdateDirectoryData {
  directory_id?: string;
  name: string;
}

export interface UpdateDirectoryResponse {
  directory: Directory;
}

export interface DeleteDirectoryResponse {
  message: string;
}

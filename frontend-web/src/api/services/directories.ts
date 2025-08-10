import api from "../client";
import type { ApiResponse } from "../types/global.types";
import type {
  CreateDirectoryData,
  CreateDirectoryResponse,
  ReadDirectoryResponse,
  UpdateDirectoryData,
  UpdateDirectoryResponse,
  DeleteDirectoryResponse,
} from "../types/directories.types";

export const createDirectory = async (
  data: CreateDirectoryData
): Promise<CreateDirectoryResponse> => {
  const response = await api.post<ApiResponse<CreateDirectoryResponse>>(
    "/directories/create",
    data
  );
  return response.data.data;
};

export const readDirectory = async (
  directory: string
): Promise<ReadDirectoryResponse> => {
  const response = await api.get<ApiResponse<ReadDirectoryResponse>>(
    `/directories/${directory}/read`
  );
  return response.data.data;
};

export const updateDirectory = async (
  directory: string,
  data: UpdateDirectoryData
): Promise<UpdateDirectoryResponse> => {
  const response = await api.put<ApiResponse<UpdateDirectoryResponse>>(
    `/directories/${directory}/update`,
    data
  );
  return response.data.data;
};

export const deleteDirectory = async (
  directory: string
): Promise<DeleteDirectoryResponse> => {
  const response = await api.delete<ApiResponse<DeleteDirectoryResponse>>(
    `/directories/${directory}/delete`
  );
  return response.data.data;
};

export const directoryService = {
  createDirectory,
  readDirectory,
  updateDirectory,
  deleteDirectory,
};

export default directoryService;

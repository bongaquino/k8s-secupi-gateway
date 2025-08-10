import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDirectory,
  readDirectory,
  updateDirectory,
  deleteDirectory,
} from "../api/services/directories";
import type {
  CreateDirectoryData,
  UpdateDirectoryData,
} from "../api/types/directories.types";

const DIRECTORIES_KEYS = {
  all: ["directories"] as const,
  lists: () => [...DIRECTORIES_KEYS.all, "list"] as const,
  list: (directory: string) =>
    [...DIRECTORIES_KEYS.lists(), directory] as const,
};

export const useReadDirectory = (
  directory: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: DIRECTORIES_KEYS.list(directory),
    queryFn: () => readDirectory(directory),
    enabled: enabled && !!directory,
    refetchOnWindowFocus: false,
  });
};

export const useCreateDirectory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDirectoryData) => createDirectory(data),
    onSuccess: () => {
      // Invalidate the parent directory to refresh the list
      queryClient.invalidateQueries({ queryKey: DIRECTORIES_KEYS.lists() });
    },
  });
};

export const useUpdateDirectory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      directory,
      data,
    }: {
      directory: string;
      data: UpdateDirectoryData;
    }) => updateDirectory(directory, data),
    onSuccess: () => {
      // Invalidate all directory queries to refresh the data
      queryClient.invalidateQueries({ queryKey: DIRECTORIES_KEYS.all });
    },
  });
};

export const useDeleteDirectory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (directory: string) => deleteDirectory(directory),
    onSuccess: () => {
      // Invalidate all directory queries to refresh the data
      queryClient.invalidateQueries({ queryKey: DIRECTORIES_KEYS.all });
    },
  });
};

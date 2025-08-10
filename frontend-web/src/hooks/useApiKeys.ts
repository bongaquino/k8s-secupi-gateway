import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getApiKeys,
  createApiKey,
  revokeApiKey,
} from "../api/services/apiKeys";
import type {
  CreateApiKeyData,
  RevokeApiKeyData,
} from "../api/types/apiKeys.types";

const API_KEYS_KEYS = {
  all: ["apiKeys"] as const,
  list: () => [...API_KEYS_KEYS.all, "list"] as const,
};

export const useApiKeys = () => {
  return useQuery({
    queryKey: API_KEYS_KEYS.list(),
    queryFn: () => getApiKeys(),
    refetchOnWindowFocus: false,
  });
};

export const useCreateApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateApiKeyData) => createApiKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_KEYS_KEYS.list() });
    },
  });
};

export const useRevokeApiKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RevokeApiKeyData) => revokeApiKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: API_KEYS_KEYS.list() });
    },
  });
};

export { API_KEYS_KEYS };

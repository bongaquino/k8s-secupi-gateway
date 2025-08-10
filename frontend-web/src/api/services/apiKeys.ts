import api from "../client";
import type {
  ApiKeysResponse,
  CreateApiKeyData,
  CreateApiKeyResponse,
  RevokeApiKeyData,
  RevokeApiKeyResponse,
} from "../types/apiKeys.types";

export const getApiKeys = async (): Promise<ApiKeysResponse> => {
  const response = await api.get<ApiKeysResponse>("/service-accounts/browse");
  return response.data;
};

export const createApiKey = async (
  data: CreateApiKeyData
): Promise<CreateApiKeyResponse> => {
  const response = await api.post<CreateApiKeyResponse>(
    "/service-accounts/generate",
    data
  );
  return response.data;
};

export const revokeApiKey = async (
  data: RevokeApiKeyData
): Promise<RevokeApiKeyResponse> => {
  const response = await api.delete<RevokeApiKeyResponse>(
    `/service-accounts/revoke?client_id=${data.client_id}`
  );
  return response.data;
};

export const apiKeysService = {
  getApiKeys,
  createApiKey,
  revokeApiKey,
};

export default apiKeysService;

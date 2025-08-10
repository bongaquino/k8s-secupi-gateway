import type { ApiResponse } from "./global.types";

export interface ApiKey {
  ID: string;
  UserID: string;
  OrganizationID: string;
  Name: string;
  ClientID: string;
  ClientSecret: string;
  PolicyID: string;
  LastUsedAt: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface ApiKeysResponse extends ApiResponse<ApiKey[]> {}

export interface CreateApiKeyData {
  name: string;
}

export interface CreateApiKeyResponse
  extends ApiResponse<{
    client_id: string;
    client_secret: string;
  }> {}

export interface RevokeApiKeyData {
  client_id: string;
}

export interface RevokeApiKeyResponse extends ApiResponse<null> {}

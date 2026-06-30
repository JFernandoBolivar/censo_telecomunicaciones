import { apiClient } from "@/shared/infrastructure/http/fetcher-api";
import type { ApiResponse } from "@/shared/types/api-response";

interface LoginApiResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    nombre_empresa: string;
    rif_empresa: string;
    is_active: boolean;
    is_staff: boolean;
  };
}

export function postLogin(email: string, password: string) {
  return apiClient.post<ApiResponse<LoginApiResponse>>("auth/login/", { email, password });
}

export function postRegister(data: {
  email: string;
  nombre_empresa: string;
  rif_empresa: string;
  password: string;
}) {
  return apiClient.post<ApiResponse<LoginApiResponse>>("auth/register/", data);
}

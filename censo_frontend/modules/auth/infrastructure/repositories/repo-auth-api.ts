import { apiClient } from "@/shared/infrastructure/http/fetcher-api";
import type { ApiResponse } from "@/shared/types/api-response";
import { mapperUsuario } from "../mappers/mapper-usuario";
import type { AuthResult, RegisterInput, RepoAuth } from "../../domain/ports/repo-auth";

interface LoginRawResponse {
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

export const repoAuthApi: RepoAuth = {
  register: async (input: RegisterInput): Promise<AuthResult> => {
    const res = await apiClient.post<ApiResponse<LoginRawResponse>>("auth/register/", {
      email: input.email,
      nombre_empresa: input.nombreEmpresa,
      rif_empresa: input.rifEmpresa,
      password: input.password,
    });

    return {
      access: res.data.access,
      refresh: res.data.refresh,
      user: mapperUsuario(res.data.user),
    };
  },
};

import { apiClient } from "@/shared/infrastructure/http/fetcher-api";
import type { ApiResponse } from "@/shared/types/api-response";

interface AdminRaw {
  usuario: {
    id: number;
    email: string;
    nombre_empresa: string;
    rif_empresa: string;
  };
  respuestas: Array<{
    pregunta_id: number;
    codigo: string;
    enunciado: string;
    tipo: string;
    respuesta: string;
  }>;
}

interface UsuarioRaw {
  id: number;
  email: string;
  nombre_empresa: string;
  rif_empresa: string;
  is_active: boolean;
  is_staff: boolean;
  fecha_creacion: string;
}

export async function getTodasRespuestas(): Promise<AdminRaw[]> {
  const res = await apiClient.get<ApiResponse<AdminRaw[]>>("encuestas/respuestas/listar/");
  return res.data;
}

export async function getUsuarios(): Promise<UsuarioRaw[]> {
  const res = await apiClient.get<ApiResponse<UsuarioRaw[]>>("auth/users/");
  return res.data;
}

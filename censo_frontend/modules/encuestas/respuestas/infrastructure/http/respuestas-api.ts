import { apiClient } from "@/shared/infrastructure/http/fetcher-api";
import type { ApiResponse } from "@/shared/types/api-response";
import type { RespuestaConsultaItem } from "../../domain/ports/repo-respuestas";

export async function postRespuestas(body: { respuestas: Array<{ pregunta: number; opcion?: number | null; respuesta?: string }> }): Promise<void> {
  await apiClient.post<ApiResponse<null>>("encuestas/respuestas/", body);
}

export async function getRespuestasConsulta(): Promise<RespuestaConsultaItem[]> {
  const res = await apiClient.get<ApiResponse<RespuestaConsultaItem[]>>("encuestas/respuestas/consultar/");
  return res.data;
}

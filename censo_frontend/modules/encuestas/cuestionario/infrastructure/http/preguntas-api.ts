import { apiClient } from "@/shared/infrastructure/http/fetcher-api";
import type { ApiResponse } from "@/shared/types/api-response";
import { mapperPreguntaList } from "../mappers/mapper-pregunta";
import type { PreguntaEntity } from "../../../shared/domain/entities/pregunta-entity";

interface PreguntaRaw {
  id: number;
  titulo: string;
  tipo_pregunta: { id: number; nombre: string };
  seccion: { id: number; seccion: string };
  es_obligatorio: boolean;
  validacion: Record<string, unknown> | null;
  opciones: Array<{ id: number; opcion: string }>;
  seleccionables: Array<{ id: number; elemento: string }>;
}

export function getPreguntas(): Promise<ApiResponse<PreguntaRaw[]>> {
  return apiClient.get<ApiResponse<PreguntaRaw[]>>("encuestas/preguntas/");
}

export async function fetchPreguntas(): Promise<PreguntaEntity[]> {
  const res = await getPreguntas();
  return mapperPreguntaList(res.data);
}

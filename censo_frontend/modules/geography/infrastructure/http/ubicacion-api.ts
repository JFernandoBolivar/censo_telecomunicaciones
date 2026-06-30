import { apiClient } from "@/shared/infrastructure/http/fetcher-api";
import type { ApiResponse } from "@/shared/types/api-response";
import { mapperEstado, mapperMunicipio, mapperParroquia } from "../mappers/mapper-ubicacion";
import type { EstadoEntity } from "../../domain/entities/estado-entity";
import type { MunicipioEntity } from "../../domain/entities/municipio-entity";
import type { ParroquiaEntity } from "../../domain/entities/parroquia-entity";

interface GeoRaw {
  id: number;
  estado?: string;
  municipio?: string;
  parroquia?: string;
}

export async function getEstados(): Promise<EstadoEntity[]> {
  const res = await apiClient.get<ApiResponse<GeoRaw[]>>("geography/direccion/estados/");
  return res.data.map(mapperEstado);
}

export async function getMunicipios(estadoId: number): Promise<MunicipioEntity[]> {
  const res = await apiClient.get<ApiResponse<GeoRaw[]>>(`geography/direccion/municipios/${estadoId}/`);
  return res.data.map(mapperMunicipio);
}

export async function getParroquias(municipioId: number): Promise<ParroquiaEntity[]> {
  const res = await apiClient.get<ApiResponse<GeoRaw[]>>(`geography/direccion/parroquias/${municipioId}/`);
  return res.data.map(mapperParroquia);
}

import type { EstadoEntity } from "../../domain/entities/estado-entity";
import { createEstadoEntity } from "../../domain/entities/estado-entity";
import type { MunicipioEntity } from "../../domain/entities/municipio-entity";
import { createMunicipioEntity } from "../../domain/entities/municipio-entity";
import type { ParroquiaEntity } from "../../domain/entities/parroquia-entity";
import { createParroquiaEntity } from "../../domain/entities/parroquia-entity";

interface GeoRaw {
  id: number;
  estado?: string;
  municipio?: string;
  parroquia?: string;
}

export function mapperEstado(raw: GeoRaw): EstadoEntity {
  return createEstadoEntity({ id: raw.id, estado: raw.estado ?? "" });
}

export function mapperMunicipio(raw: GeoRaw): MunicipioEntity {
  return createMunicipioEntity({ id: raw.id, municipio: raw.municipio ?? "" });
}

export function mapperParroquia(raw: GeoRaw): ParroquiaEntity {
  return createParroquiaEntity({ id: raw.id, parroquia: raw.parroquia ?? "" });
}

import type { RepoUbicacion } from "../../domain/ports/repo-ubicacion";
import type { EstadoEntity } from "../../domain/entities/estado-entity";
import type { MunicipioEntity } from "../../domain/entities/municipio-entity";
import type { ParroquiaEntity } from "../../domain/entities/parroquia-entity";
import { getEstados, getMunicipios, getParroquias } from "../http/ubicacion-api";

export const repoUbicacionApi: RepoUbicacion = {
  listarEstados: async (): Promise<EstadoEntity[]> => getEstados(),
  listarMunicipios: async (estadoId: number): Promise<MunicipioEntity[]> => getMunicipios(estadoId),
  listarParroquias: async (municipioId: number): Promise<ParroquiaEntity[]> => getParroquias(municipioId),
};

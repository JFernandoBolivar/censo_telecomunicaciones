import type { EstadoEntity } from "../entities/estado-entity";
import type { MunicipioEntity } from "../entities/municipio-entity";
import type { ParroquiaEntity } from "../entities/parroquia-entity";

export interface RepoUbicacion {
  listarEstados(): Promise<EstadoEntity[]>;
  listarMunicipios(estadoId: number): Promise<MunicipioEntity[]>;
  listarParroquias(municipioId: number): Promise<ParroquiaEntity[]>;
}

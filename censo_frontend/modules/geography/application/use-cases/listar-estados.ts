import type { RepoUbicacion } from "../../domain/ports/repo-ubicacion";
import type { EstadoDTO, MunicipioDTO, ParroquiaDTO } from "../dtos/ubicacion-dto";

export async function listarEstados(repo: RepoUbicacion): Promise<EstadoDTO[]> {
  const entities = await repo.listarEstados();
  return entities.map((e) => ({ id: e.id, estado: e.estado }));
}

export async function listarMunicipios(repo: RepoUbicacion, estadoId: number): Promise<MunicipioDTO[]> {
  const entities = await repo.listarMunicipios(estadoId);
  return entities.map((e) => ({ id: e.id, municipio: e.municipio }));
}

export async function listarParroquias(repo: RepoUbicacion, municipioId: number): Promise<ParroquiaDTO[]> {
  const entities = await repo.listarParroquias(municipioId);
  return entities.map((e) => ({ id: e.id, parroquia: e.parroquia }));
}

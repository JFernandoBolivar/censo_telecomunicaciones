"use server";

import { listarEstados, listarMunicipios, listarParroquias } from "../../application/use-cases/listar-estados";
import { repoUbicacionApi } from "../repositories/repo-ubicacion-api";

export async function fetchEstadosAction() {
  return listarEstados(repoUbicacionApi);
}

export async function fetchMunicipiosAction(estadoId: number) {
  return listarMunicipios(repoUbicacionApi, estadoId);
}

export async function fetchParroquiasAction(municipioId: number) {
  return listarParroquias(repoUbicacionApi, municipioId);
}

"use server";

import { listarPreguntas } from "../../application/use-cases/listar-preguntas";
import { repoPreguntasApi } from "../repositories/repo-preguntas-api";

export async function fetchPreguntasAction() {
  return listarPreguntas(repoPreguntasApi);
}

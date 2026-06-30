"use server";

import { enviarRespuestas } from "../../application/use-cases/enviar-respuestas";
import { consultarRespuestas } from "../../application/use-cases/consultar-respuestas";
import { repoRespuestasApi } from "../repositories/repo-respuestas-api";
import type { RespuestaEnvioDTO } from "../../application/dtos/respuesta-dto";

export async function enviarRespuestasAction(respuestas: RespuestaEnvioDTO[]) {
  try {
    await enviarRespuestas(repoRespuestasApi, respuestas);
    return { success: "Respuestas enviadas correctamente" };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al enviar respuestas" };
  }
}

export async function consultarRespuestasAction() {
  return consultarRespuestas(repoRespuestasApi);
}

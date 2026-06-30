import type { RepoRespuestas, EnviarRespuestasInput, ConsultarRespuestasOutput } from "../../domain/ports/repo-respuestas";
import { postRespuestas, getRespuestasConsulta } from "../http/respuestas-api";

export const repoRespuestasApi: RepoRespuestas = {
  enviar: async (input: EnviarRespuestasInput): Promise<void> => {
    await postRespuestas(input);
  },
  consultar: async (): Promise<ConsultarRespuestasOutput> => {
    return getRespuestasConsulta();
  },
};

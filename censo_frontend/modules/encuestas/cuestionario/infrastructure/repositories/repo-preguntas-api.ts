import type { RepoPreguntas } from "../../domain/ports/repo-preguntas";
import type { PreguntaEntity } from "../../../shared/domain/entities/pregunta-entity";
import { fetchPreguntas } from "../http/preguntas-api";

export const repoPreguntasApi: RepoPreguntas = {
  getAll: async (): Promise<PreguntaEntity[]> => {
    return fetchPreguntas();
  },
};

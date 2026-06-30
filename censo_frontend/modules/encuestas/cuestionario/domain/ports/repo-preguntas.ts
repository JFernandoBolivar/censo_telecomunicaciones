import type { PreguntaEntity } from "../../../shared/domain/entities/pregunta-entity";

export interface RepoPreguntas {
  getAll(): Promise<PreguntaEntity[]>;
}

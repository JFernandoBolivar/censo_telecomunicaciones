import type { TipoPreguntaEntity } from "./tipo-pregunta-entity";
import type { SeccionEntity } from "./seccion-entity";
import type { OpcionEntity } from "./opcion-entity";
import type { ValidacionVO } from "../value-objects/validacion-vo";

export interface PreguntaEntity {
  readonly id: number;
  readonly titulo: string;
  readonly tipoPregunta: TipoPreguntaEntity;
  readonly seccion: SeccionEntity;
  readonly esObligatorio: boolean;
  readonly validacion: ValidacionVO | null;
  readonly opciones: OpcionEntity[];
  readonly seleccionables: OpcionEntity[];
}

export function createPreguntaEntity(data: {
  id: number;
  titulo: string;
  tipoPregunta: TipoPreguntaEntity;
  seccion: SeccionEntity;
  esObligatorio: boolean;
  validacion: ValidacionVO | null;
  opciones: OpcionEntity[];
  seleccionables: OpcionEntity[];
}): PreguntaEntity {
  if (!data.titulo.trim()) throw new Error("Pregunta: título requerido");
  return { ...data };
}

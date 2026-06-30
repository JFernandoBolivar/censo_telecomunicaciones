import type { TipoPreguntaEntity } from "../../../shared/domain/entities/tipo-pregunta-entity";
import type { SeccionEntity } from "../../../shared/domain/entities/seccion-entity";

export interface OpcionDTO {
  id: number;
  opcion: string;
}

export interface PreguntaItemDTO {
  id: number;
  titulo: string;
  tipoPregunta: { id: number; nombre: string };
  seccion: { id: number; seccion: string };
  esObligatorio: boolean;
  validacion: Record<string, unknown> | null;
  opciones: OpcionDTO[];
  seleccionables: OpcionDTO[];
}

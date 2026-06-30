import type { PreguntaEntity } from "../../../shared/domain/entities/pregunta-entity";
import { createPreguntaEntity } from "../../../shared/domain/entities/pregunta-entity";
import { createTipoPreguntaEntity } from "../../../shared/domain/entities/tipo-pregunta-entity";
import { createSeccionEntity } from "../../../shared/domain/entities/seccion-entity";
import { createOpcionEntity } from "../../../shared/domain/entities/opcion-entity";
import { createValidacionVO } from "../../../shared/domain/value-objects/validacion-vo";

interface PreguntaRaw {
  id: number;
  titulo: string;
  tipo_pregunta: { id: number; nombre: string };
  seccion: { id: number; seccion: string };
  es_obligatorio: boolean;
  validacion: Record<string, unknown> | null;
  opciones: Array<{ id: number; opcion: string }>;
  seleccionables: Array<{ id: number; elemento: string }>;
}

export function mapperPregunta(raw: PreguntaRaw): PreguntaEntity {
  return createPreguntaEntity({
    id: raw.id,
    titulo: raw.titulo,
    tipoPregunta: createTipoPreguntaEntity(raw.tipo_pregunta),
    seccion: createSeccionEntity(raw.seccion),
    esObligatorio: raw.es_obligatorio,
    validacion: createValidacionVO(raw.validacion),
    opciones: (raw.opciones ?? []).map((o) => createOpcionEntity({ id: o.id, opcion: o.opcion })),
    seleccionables: (raw.seleccionables ?? []).map((s) => createOpcionEntity({ id: s.id, opcion: s.elemento })),
  });
}

export function mapperPreguntaList(rawArray: PreguntaRaw[]): PreguntaEntity[] {
  return rawArray.map(mapperPregunta);
}

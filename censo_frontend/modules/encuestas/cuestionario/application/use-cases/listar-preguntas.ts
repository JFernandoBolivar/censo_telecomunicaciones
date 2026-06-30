import type { RepoPreguntas } from "../../domain/ports/repo-preguntas";
import type { PreguntaItemDTO } from "../dtos/pregunta-dto";
import type { OpcionEntity } from "../../../shared/domain/entities/opcion-entity";

export async function listarPreguntas(repo: RepoPreguntas): Promise<PreguntaItemDTO[]> {
  const entities = await repo.getAll();

  return entities.map((e) => ({
    id: e.id,
    titulo: e.titulo,
    tipoPregunta: { id: e.tipoPregunta.id, nombre: e.tipoPregunta.nombre },
    seccion: { id: e.seccion.id, seccion: e.seccion.seccion },
    esObligatorio: e.esObligatorio,
    validacion: e.validacion as unknown as Record<string, unknown> | null,
    opciones: e.opciones.map(mapOpcion),
    seleccionables: e.seleccionables.map(mapOpcion),
  }));
}

function mapOpcion(o: OpcionEntity): { id: number; opcion: string } {
  return { id: o.id, opcion: o.opcion };
}

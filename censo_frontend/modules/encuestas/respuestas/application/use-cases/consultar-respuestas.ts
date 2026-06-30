import type { RepoRespuestas } from "../../domain/ports/repo-respuestas";
import type { RespuestaUsuarioDTO } from "../dtos/respuesta-dto";

export async function consultarRespuestas(repo: RepoRespuestas): Promise<RespuestaUsuarioDTO[]> {
  const items = await repo.consultar();
  const flat: RespuestaUsuarioDTO[] = [];

  for (const item of items) {
    if (!item.respuestas_usuario) continue;

    const texto = item.respuestas_usuario.textos[0]?.respuesta;
    const opcion = item.respuestas_usuario.opciones[0]?.opcion;

    if (texto || opcion) {
      flat.push({
        preguntaId: item.id,
        titulo: item.titulo,
        respuestaTexto: texto,
        respuestaOpcion: opcion,
        fecha: item.respuestas_usuario.textos[0]?.fecha_respuesta
          ?? item.respuestas_usuario.opciones[0]?.fecha_respuesta
          ?? "",
      });
    }
  }

  return flat;
}

import type { RepoRespuestas, EnviarRespuestasInput } from "../../domain/ports/repo-respuestas";
import type { RespuestaEnvioDTO } from "../dtos/respuesta-dto";

export async function enviarRespuestas(repo: RepoRespuestas, dto: RespuestaEnvioDTO[]): Promise<void> {
  const input: EnviarRespuestasInput = {
    respuestas: dto.map((r) => ({
      pregunta: r.pregunta,
      opcion: r.opcion ?? null,
      respuesta: r.respuesta ?? "",
    })),
  };
  await repo.enviar(input);
}

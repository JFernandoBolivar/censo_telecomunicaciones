export interface RespuestaEntity {
  readonly preguntaId: number;
  readonly opcion?: number;
  readonly respuesta?: string;
}

export function createRespuestaEntity(data: {
  preguntaId: number;
  opcion?: number;
  respuesta?: string;
}): RespuestaEntity {
  if (!data.preguntaId) throw new Error("Respuesta: pregunta ID requerido");
  return { ...data };
}

export interface RespuestaEnvioDTO {
  pregunta: number;
  opcion?: number | null;
  respuesta?: string;
}

export interface EnviarRespuestasDTO {
  respuestas: RespuestaEnvioDTO[];
}

export interface RespuestaUsuarioDTO {
  preguntaId: number;
  titulo: string;
  respuestaTexto?: string;
  respuestaOpcion?: string;
  fecha: string;
}

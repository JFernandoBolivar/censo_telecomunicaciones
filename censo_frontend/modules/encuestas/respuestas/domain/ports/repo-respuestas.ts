export interface EnviarRespuestasInput {
  respuestas: Array<{
    pregunta: number;
    opcion?: number | null;
    respuesta?: string;
  }>;
}

export interface RespuestaConsultaItem {
  id: number;
  titulo: string;
  tipo_pregunta: { id: number; nombre: string };
  seccion: { id: number; seccion: string };
  es_obligatorio: boolean;
  validacion: Record<string, unknown> | null;
  opciones: Array<{ id: number; opcion: string }>;
  respuestas_usuario: {
    textos: Array<{ id: number; respuesta: string; fecha_respuesta: string }>;
    opciones: Array<{ id: number; opcion_id: number; opcion: string; fecha_respuesta: string }>;
  } | null;
}

export type ConsultarRespuestasOutput = RespuestaConsultaItem[];

export interface RepoRespuestas {
  enviar(input: EnviarRespuestasInput): Promise<void>;
  consultar(): Promise<ConsultarRespuestasOutput>;
}

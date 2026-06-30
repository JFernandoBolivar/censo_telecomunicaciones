import { z } from "zod";
import type { PreguntaItemDTO } from "@/modules/encuestas/cuestionario/application/dtos/pregunta-dto";

export function buildRespuestaSchema(preguntas: PreguntaItemDTO[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const p of preguntas) {
    const key = `pregunta_${p.id}`;
    const tipo = p.tipoPregunta.nombre;
    const v = p.validacion;

    if (tipo === "seleccion") {
      shape[key] = p.esObligatorio
        ? z.string().min(1, "Debe seleccionar una opción")
        : z.string().optional();
    } else if (tipo === "seleccion multiple") {
      shape[key] = p.esObligatorio
        ? z.array(z.string())
        : z.array(z.string()).optional();
    } else if (tipo === "seleccion geografica") {
      shape[key] = p.esObligatorio
        ? z.string().min(1, "Debe seleccionar una ubicación")
        : z.string().optional();
    } else {
      let s = buildTextSchema(p, v);
      shape[key] = s;
    }
  }

  return z.object(shape);
}

function buildTextSchema(p: PreguntaItemDTO, v: Record<string, unknown> | null): z.ZodTypeAny {
  let s: z.ZodString = z.string();

  if (v?.regex && typeof v.regex === "string") {
    try { s = s.regex(new RegExp(v.regex), "Formato inválido"); } catch {}
  }
  if (typeof v?.minChars === "number" && v.minChars > 0) {
    s = s.min(v.minChars, `Mínimo ${v.minChars} caracteres`);
  }
  if (typeof v?.maxChars === "number" && v.maxChars > 0) {
    s = s.max(v.maxChars, `Máximo ${v.maxChars} caracteres`);
  }
  if (p.esObligatorio) {
    s = s.min(1, "Campo obligatorio");
    return s;
  }
  return s.optional();
}

export type RespuestasFormValues = z.infer<ReturnType<typeof buildRespuestaSchema>>;

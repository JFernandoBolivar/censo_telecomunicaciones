"use client";

import { useWatch } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import type { PreguntaItemDTO } from "../application/dtos/pregunta-dto";
import type { RespuestasFormValues } from "@/modules/encuestas/respuestas/ui/schema/schema-respuesta-dinamico";
import { PreguntaCard } from "./pregunta-card";

interface RenderizadorPreguntaProps {
  pregunta: PreguntaItemDTO;
  todasLasPreguntas: PreguntaItemDTO[];
  form: UseFormReturn<RespuestasFormValues>;
}

export function RenderizadorPregunta({
  pregunta,
  todasLasPreguntas,
  form,
}: RenderizadorPreguntaProps) {
  const watchedValues = useWatch({ control: form.control });

  const dependsOn = pregunta.validacion?.dependsOn as
    | { parentQuestionCode: string; expectedValue: string; actionIfFalse: "hide" }
    | undefined;

  if (dependsOn) {
    const parent = todasLasPreguntas.find(
      (p) => p.validacion?.codigo === dependsOn.parentQuestionCode,
    );
    if (parent) {
      const parentKey = `pregunta_${parent.id}`;
      const parentValue = (watchedValues as Record<string, unknown>)[parentKey];
      const parentOpcion = parent.opciones.find((o) => o.id === Number(parentValue));
      if (!parentOpcion || parentOpcion.opcion !== dependsOn.expectedValue) {
        return null;
      }
    }
  }

  return (
    <PreguntaCard
      pregunta={pregunta}
      form={form}
      name={`pregunta_${pregunta.id}` as const}
    />
  );
}

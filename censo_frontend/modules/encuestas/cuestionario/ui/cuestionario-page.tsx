"use client";

import { useMemo } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { fetchPreguntasAction } from "../infrastructure/actions/preguntas-actions";
import {
  enviarRespuestasAction,
  consultarRespuestasAction,
} from "@/modules/encuestas/respuestas/infrastructure/actions/respuestas-actions";
import { RenderizadorPregunta } from "./renderizador-pregunta";
import { Button } from "@/shared/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/components/card";
import { Skeleton } from "@/shared/ui/components/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/shared/ui/components/empty";
import { PaperPlaneRight, CheckCircle, Spinner } from "@phosphor-icons/react";
import { toast } from "sonner";
import {
  buildRespuestaSchema,
  type RespuestasFormValues,
} from "@/modules/encuestas/respuestas/ui/schema/schema-respuesta-dinamico";

export function CuestionarioPage() {
  const {
    data: preguntas,
    error,
    isLoading,
  } = useSWR("preguntas", fetchPreguntasAction);
  const { data: respuestasExistentes, isLoading: loadingRespuestas } = useSWR(
    "respuestas-consulta",
    consultarRespuestasAction,
  );
  const router = useRouter();

  const schema = useMemo(
    () => (preguntas ? buildRespuestaSchema(preguntas) : null),
    [preguntas],
  );

  const { mutate } = useSWRConfig();

  const form = useForm<RespuestasFormValues>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {},
    shouldUnregister: true,
  });

  const yaRespondio =
    !loadingRespuestas &&
    respuestasExistentes &&
    respuestasExistentes.length > 0;

  if (isLoading || loadingRespuestas) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Error al cargar</EmptyTitle>
          <EmptyDescription>
            No se pudieron cargar las preguntas.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (!preguntas || preguntas.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Sin encuestas activas</EmptyTitle>
          <EmptyDescription>
            No hay encuestas disponibles en este momento.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (yaRespondio) {
    return (
      <div className="mx-auto max-w-3xl space-y-8">
        <Card>
          <CardHeader className="items-center text-center">
            <CheckCircle className="size-12 text-emerald-500" />
            <CardTitle>Encuesta completada</CardTitle>
            <p className="text-sm text-muted-foreground">
              Ya ha enviado sus respuestas. Gracias por participar.
            </p>
          </CardHeader>
          {respuestasExistentes.length > 0 && (
            <CardContent className="flex flex-col gap-4">
              {respuestasExistentes.map((r) => (
                <div key={r.preguntaId} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{r.titulo}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.respuestaTexto || r.respuestaOpcion || "—"}
                  </p>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  const agrupadas = preguntas.reduce<Record<string, typeof preguntas>>(
    (acc, p) => {
      const key = p.seccion.seccion;
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    },
    {},
  );

  const onSubmit = async (data: RespuestasFormValues) => {
    const respuestas = Object.entries(data)
      .filter(([_, value]) => value !== undefined && value !== "")
      .map(([key, value]) => {
        const preguntaId = Number(key.replace("pregunta_", ""));
        const pregunta = preguntas.find((p) => p.id === preguntaId);
        if (!pregunta) return null;

        const esSelect = pregunta.tipoPregunta.nombre === "seleccion";
        const esMultiple =
          pregunta.tipoPregunta.nombre === "seleccion multiple";

        return {
          pregunta: preguntaId,
          opcion: esSelect
            ? Number(value)
            : esMultiple
              ? Number(Array.isArray(value) ? value[0] : value)
              : null,
          respuesta: !esSelect && !esMultiple ? String(value ?? "") : "",
        };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null);

    const result = await enviarRespuestasAction(respuestas);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Respuestas enviadas correctamente");
    mutate("respuestas-consulta");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Encuesta de Infraestructura y VGT
        </h1>
        <p className="text-muted-foreground">
          Complete los campos obligatorios marcados con *
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {Object.entries(agrupadas).map(([seccion, preguntasSeccion]) => (
          <Card key={seccion}>
            <CardHeader>
              <CardTitle className="text-lg">{seccion}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {preguntasSeccion.map((pregunta) => (
                <RenderizadorPregunta
                  key={pregunta.id}
                  pregunta={pregunta}
                  todasLasPreguntas={preguntas}
                  form={form}
                />
              ))}
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Spinner className="size-4 animate-spin" />
            ) : (
              <PaperPlaneRight className="size-4" />
            )}
            {form.formState.isSubmitting ? "Enviando..." : "Enviar Respuestas"}
          </Button>
        </div>
      </form>
    </div>
  );
}

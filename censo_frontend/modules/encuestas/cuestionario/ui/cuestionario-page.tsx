"use client";

import { useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { fetchPreguntasAction } from "../infrastructure/actions/preguntas-actions";
import { enviarRespuestasAction, consultarRespuestasAction } from "@/modules/encuestas/respuestas/infrastructure/actions/respuestas-actions";
import { RenderizadorPregunta } from "./renderizador-pregunta";
import { Button } from "@/shared/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/components/card";
import { Skeleton } from "@/shared/ui/components/skeleton";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/shared/ui/components/empty";
import { PaperPlaneRight, CheckCircle, Spinner, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import { toast } from "sonner";
import { buildRespuestaSchema, type RespuestasFormValues } from "@/modules/encuestas/respuestas/ui/schema/schema-respuesta-dinamico";

export function CuestionarioPage() {
  const { data: preguntas, error, isLoading } = useSWR("preguntas", fetchPreguntasAction);
  const { data: respuestasExistentes, isLoading: loadingRespuestas } = useSWR("respuestas-consulta", consultarRespuestasAction);
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [step, setStep] = useState(0);

  const schema = useMemo(() => preguntas ? buildRespuestaSchema(preguntas) : null, [preguntas]);

  const form = useForm<RespuestasFormValues>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {},
  });

  const yaRespondio = !loadingRespuestas && respuestasExistentes && respuestasExistentes.length > 0;

  const agrupadas = useMemo(() => {
    if (!preguntas) return [];
    const map = preguntas.reduce<Record<string, typeof preguntas>>((acc, p) => {
      const key = p.seccion.seccion;
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    }, {});
    return Object.entries(map);
  }, [preguntas]);

  const totalSteps = agrupadas.length;

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
          <EmptyDescription>No se pudieron cargar las preguntas.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (!preguntas || preguntas.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Sin encuestas activas</EmptyTitle>
          <EmptyDescription>No hay encuestas disponibles en este momento.</EmptyDescription>
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
            <CardTitle className="text-[#f1f5f9]">Encuesta completada</CardTitle>
            <p className="text-sm text-[#94a3b8]">Ya ha enviado sus respuestas. Gracias por participar.</p>
          </CardHeader>
          {respuestasExistentes.length > 0 && (
            <CardContent className="flex flex-col gap-4">
              {respuestasExistentes.map((r) => (
                <div key={r.preguntaId} className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-3">
                  <p className="text-sm font-medium text-[#f1f5f9]">{r.titulo}</p>
                  <p className="text-sm text-[#94a3b8]">{r.respuestaTexto || r.respuestaOpcion || "—"}</p>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      </div>
    );
  }

  const onSubmit = async (data: RespuestasFormValues) => {
    const respuestas = Object.entries(data)
      .filter(([_, value]) => value !== undefined && value !== "")
      .map(([key, value]) => {
        const preguntaId = Number(key.replace("pregunta_", ""));
        const pregunta = preguntas.find((p) => p.id === preguntaId);
        if (!pregunta) return null;
        const esSelect = pregunta.tipoPregunta.nombre === "seleccion";
        const esMultiple = pregunta.tipoPregunta.nombre === "seleccion multiple";
        return {
          pregunta: preguntaId,
          opcion: esSelect ? Number(value) : esMultiple ? Number(Array.isArray(value) ? value[0] : value) : null,
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
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#f1f5f9]">Encuesta de Infraestructura y VGT</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">Complete los campos obligatorios marcados con *</p>
      </div>

      {/* Step indicator */}
      <div className="flex flex-wrap justify-center gap-2">
        {agrupadas.map(([seccion], i) => {
          const isActive = i === step;
          const isDone = i < step;
          return (
            <button
              key={seccion}
              type="button"
              onClick={() => { if (i < step) setStep(i); }}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold uppercase tracking-[0.5px] transition-all duration-300 ${
                isActive
                  ? "border-[rgba(30,107,255,0.2)] bg-[rgba(30,107,255,0.08)] text-[#60a5fa]"
                  : isDone
                    ? "border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.08)] text-[#22c55e] cursor-pointer"
                    : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-[#64748b]"
              }`}
            >
              <span className={`flex size-6 items-center justify-center rounded-lg text-[11px] font-bold ${
                isActive ? "bg-[#1e6bff] text-white" : isDone ? "bg-[#22c55e] text-white" : "bg-[rgba(255,255,255,0.05)] text-[#64748b]"
              }`}>
                {i + 1}
              </span>
              {seccion}
            </button>
          );
        })}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <Card className="!rounded-2xl !border !border-[rgba(255,255,255,0.06)] !bg-[rgba(17,24,39,0.85)] backdrop-blur-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.15)]">
              <CardHeader className="border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2 text-sm font-medium text-[#94a3b8]">
                  <span className="text-[#f1f5f9]">{step + 1}/{totalSteps}</span>
                  <span className="text-[#64748b]">·</span>
                  <span className="text-[#60a5fa]">{agrupadas[step][0]}</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-6 pt-6">
                {agrupadas[step][1].map((pregunta) => (
                  <RenderizadorPregunta
                    key={pregunta.id}
                    pregunta={pregunta}
                    todasLasPreguntas={preguntas}
                    form={form}
                  />
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <div>
            {step > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="!rounded-2xl border border-[rgba(255,255,255,0.06)] !bg-[rgba(255,255,255,0.03)] !text-[#94a3b8] hover:!bg-[rgba(255,255,255,0.08)] hover:!text-[#f1f5f9]"
              >
                <ArrowLeft className="mr-2 size-4" weight="bold" />
                Anterior
              </Button>
            )}
          </div>
          <div>
            {step < totalSteps - 1 ? (
              <Button
                type="button"
                onClick={() => setStep(step + 1)}
                className="!rounded-2xl !bg-gradient-to-br !from-[#0b3c91] !to-[#1e6bff] !text-white"
              >
                Siguiente
                <ArrowRight className="ml-2 size-4" weight="bold" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="!rounded-2xl !bg-gradient-to-br !from-[#16a34a] !to-[#22c55e] !text-white"
              >
                {form.formState.isSubmitting ? (
                  <Spinner className="mr-2 size-4 animate-spin" />
                ) : (
                  <PaperPlaneRight className="mr-2 size-4" weight="bold" />
                )}
                {form.formState.isSubmitting ? "Enviando..." : "Enviar Respuestas"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

"use client";

import { Controller } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { Input } from "@/shared/ui/components/input";
import { Label } from "@/shared/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/components/radio-group";
import { Checkbox } from "@/shared/ui/components/checkbox";
import type { PreguntaItemDTO } from "../application/dtos/pregunta-dto";
import type { RespuestasFormValues } from "@/modules/encuestas/respuestas/ui/schema/schema-respuesta-dinamico";
import { SelectorUbicacion } from "@/modules/geography/ui/selector-ubicacion";
import { InputForm } from "@/shared/ui/components/input-form";
import { TextareaForm } from "@/shared/ui/components/textarea-form";

interface PreguntaCardProps {
  pregunta: PreguntaItemDTO;
  form: UseFormReturn<RespuestasFormValues>;
  name: `pregunta_${number}`;
}

export function PreguntaCard({ pregunta, form, name }: PreguntaCardProps) {
  const tipo = pregunta.tipoPregunta.nombre;
  const esTextoCorto = tipo === "texto";
  const esTextoLargo = tipo === "texto largo";
  const esNumerico = ["entero", "decimal"].includes(tipo);
  const esSelect = tipo === "seleccion";
  const esMultiple = tipo === "seleccion multiple";
  const esGeografica = tipo === "seleccion geografica";

  if (esTextoCorto) {
    return (
      <InputForm<RespuestasFormValues>
        form={form}
        name={name}
        title={pregunta.titulo}
        type="text"
        placeholder="Escriba su respuesta..."
        subTitle={pregunta.esObligatorio ? undefined : "(opcional)"}
      />
    );
  }

  if (esTextoLargo) {
    return (
      <TextareaForm<RespuestasFormValues>
        form={form}
        name={name}
        title={pregunta.titulo}
        placeholder="Escriba su respuesta..."
        subTitle={pregunta.esObligatorio ? undefined : "(opcional)"}
        rows={4}
      />
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium leading-relaxed">
        {pregunta.titulo}
        {pregunta.esObligatorio && <span className="ml-1 text-destructive">*</span>}
      </Label>

      {esNumerico && (
        <Controller
          control={form.control}
          name={name}
          render={({ field, fieldState }) => (
            <div>
              <Input
                {...field}
                value={String(field.value ?? "")}
                type="number"
                step={tipo === "decimal" ? "0.01" : "1"}
                placeholder="0"
              />
              {fieldState.error?.message && (
                <p className="mt-1 text-xs text-destructive">{fieldState.error.message}</p>
              )}
            </div>
          )}
        />
      )}

      {esSelect && (
        <Controller
          control={form.control}
          name={name}
          render={({ field, fieldState }) => (
            <div>
              <RadioGroup
                value={String(field.value ?? "")}
                onValueChange={field.onChange}
              >
                {pregunta.opciones.map((op) => (
                  <div key={op.id} className="flex items-center gap-2">
                    <RadioGroupItem value={String(op.id)} id={`opt-${op.id}`} />
                    <Label htmlFor={`opt-${op.id}`}>{op.opcion}</Label>
                  </div>
                ))}
              </RadioGroup>
              {fieldState.error?.message && (
                <p className="mt-1 text-xs text-destructive">{fieldState.error.message}</p>
              )}
            </div>
          )}
        />
      )}

      {esMultiple && (
        <Controller
          control={form.control}
          name={name}
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              {pregunta.opciones.map((op) => (
                <div key={op.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`chk-${op.id}`}
                    checked={Array.isArray(field.value) && field.value.includes(String(op.id))}
                    onCheckedChange={(checked) => {
                      const current = Array.isArray(field.value) ? [...field.value] : [];
                      if (checked) {
                        field.onChange([...current, String(op.id)]);
                      } else {
                        field.onChange(current.filter((v: string) => v !== String(op.id)));
                      }
                    }}
                  />
                  <Label htmlFor={`chk-${op.id}`}>{op.opcion}</Label>
                </div>
              ))}
            </div>
          )}
        />
      )}

      {esGeografica && (
        <Controller
          control={form.control}
          name={name}
          render={({ field }) => (
            <SelectorUbicacion
              value={typeof field.value === "string" ? JSON.parse(field.value) : undefined}
              onChange={(v) => field.onChange(JSON.stringify(v))}
            />
          )}
        />
      )}
    </div>
  );
}

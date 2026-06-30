"use client";

import useSWR from "swr";
import { fetchEstadosAction, fetchMunicipiosAction, fetchParroquiasAction } from "../infrastructure/actions/ubicacion-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/components/select";
import { Label } from "@/shared/ui/components/label";
import { MapPin } from "@phosphor-icons/react";
import { useState } from "react";

interface SelectorUbicacionProps {
  value?: { estadoId?: number; municipioId?: number; parroquiaId?: number };
  onChange?: (value: { estadoId?: number; municipioId?: number; parroquiaId?: number }) => void;
}

export function SelectorUbicacion({ value, onChange }: SelectorUbicacionProps) {
  const { data: estados } = useSWR("geo-estados", fetchEstadosAction);
  const { data: municipios } = useSWR(
    value?.estadoId ? `geo-municipios-${value.estadoId}` : null,
    () => fetchMunicipiosAction(value!.estadoId!),
  );
  const { data: parroquias } = useSWR(
    value?.municipioId ? `geo-parroquias-${value.municipioId}` : null,
    () => fetchParroquiasAction(value!.municipioId!),
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="size-4" />
        <span>Ubicación</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Estado</Label>
          <Select
            value={value?.estadoId ? String(value.estadoId) : ""}
            onValueChange={(v) => onChange?.({ estadoId: Number(v) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione" />
            </SelectTrigger>
            <SelectContent>
              {(estados ?? []).map((e) => (
                <SelectItem key={e.id} value={String(e.id)}>
                  {e.estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Municipio</Label>
          <Select
            value={value?.municipioId ? String(value.municipioId) : ""}
            onValueChange={(v) => onChange?.({ ...value, municipioId: Number(v) })}
            disabled={!value?.estadoId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione" />
            </SelectTrigger>
            <SelectContent>
              {(municipios ?? []).map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>
                  {m.municipio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs">Parroquia</Label>
          <Select
            value={value?.parroquiaId ? String(value.parroquiaId) : ""}
            onValueChange={(v) => onChange?.({ ...value, parroquiaId: Number(v) })}
            disabled={!value?.municipioId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione" />
            </SelectTrigger>
            <SelectContent>
              {(parroquias ?? []).map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.parroquia}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

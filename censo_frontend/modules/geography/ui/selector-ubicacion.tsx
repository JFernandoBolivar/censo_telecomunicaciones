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
import { MapPin, Plus, X } from "@phosphor-icons/react";
import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/shared/ui/components/button";

interface UbicacionItem {
  estadoId: number;
  municipioId: number;
  parroquiaId: number;
}

interface SelectorUbicacionProps {
  value?: UbicacionItem[] | UbicacionItem;
  onChange?: (value: UbicacionItem[]) => void;
}

export function SelectorUbicacion({ value, onChange }: SelectorUbicacionProps) {
  const [tempEstado, setTempEstado] = useState("");
  const [tempMunicipio, setTempMunicipio] = useState("");
  const [tempParroquia, setTempParroquia] = useState("");

  const items = useMemo(() => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return [value];
  }, [value]);

  const canAdd = tempEstado && tempMunicipio && tempParroquia;

  const { data: estados } = useSWR("geo-estados", fetchEstadosAction);
  const { data: municipiosRaw } = useSWR(
    tempEstado ? `geo-municipios-${tempEstado}` : null,
    () => fetchMunicipiosAction(Number(tempEstado)),
  );
  const { data: parroquiasRaw } = useSWR(
    tempMunicipio ? `geo-parroquias-${tempMunicipio}` : null,
    () => fetchParroquiasAction(Number(tempMunicipio)),
  );

  // Accumulate all fetched geography names
  const labelCache = useRef<{ municipios: Record<number, string>; parroquias: Record<number, string> }>({
    municipios: {},
    parroquias: {},
  });

  useEffect(() => {
    if (municipiosRaw) {
      for (const m of municipiosRaw) {
        labelCache.current.municipios[m.id] = m.municipio;
      }
    }
  }, [municipiosRaw]);

  useEffect(() => {
    if (parroquiasRaw) {
      for (const p of parroquiasRaw) {
        labelCache.current.parroquias[p.id] = p.parroquia;
      }
    }
  }, [parroquiasRaw]);

  const estadoLabel = (id: number) => estados?.find((e) => e.id === id)?.estado ?? String(id);
  const municipioLabel = (id: number) => labelCache.current.municipios[id] ?? String(id);
  const parroquiaLabel = (id: number) => labelCache.current.parroquias[id] ?? String(id);

  const handleAdd = () => {
    if (!canAdd) return;
    const newItem: UbicacionItem = {
      estadoId: Number(tempEstado),
      municipioId: Number(tempMunicipio),
      parroquiaId: Number(tempParroquia),
    };
    onChange?.([...items, newItem]);
    setTempEstado("");
    setTempMunicipio("");
    setTempParroquia("");
  };

  const handleRemove = (index: number) => {
    onChange?.(items.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
        <MapPin className="size-4" />
        <span>Ubicación</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-[#94a3b8]">Estado</Label>
          <Select value={tempEstado} onValueChange={(v) => { if (v) { setTempEstado(v); setTempMunicipio(""); setTempParroquia(""); } }}>
            <SelectTrigger className="!border-[rgba(255,255,255,0.06)] !bg-[rgba(255,255,255,0.03)] !text-[#f1f5f9]">
              <SelectValue placeholder="Seleccione">
                {tempEstado ? estados?.find(e => e.id === Number(tempEstado))?.estado : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(estados ?? []).map((e) => (
                <SelectItem key={e.id} value={String(e.id)}>{e.estado}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-[#94a3b8]">Municipio</Label>
          <Select value={tempMunicipio} onValueChange={(v) => { if (v) { setTempMunicipio(v); setTempParroquia(""); } }} disabled={!tempEstado}>
            <SelectTrigger className="!border-[rgba(255,255,255,0.06)] !bg-[rgba(255,255,255,0.03)] !text-[#f1f5f9]">
              <SelectValue placeholder="Seleccione">
                {tempMunicipio && municipiosRaw ? municipiosRaw.find(m => m.id === Number(tempMunicipio))?.municipio : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(municipiosRaw ?? []).map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>{m.municipio}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-[#94a3b8]">Parroquia</Label>
          <Select value={tempParroquia} onValueChange={(v) => { if (v) setTempParroquia(v); }} disabled={!tempMunicipio}>
            <SelectTrigger className="!border-[rgba(255,255,255,0.06)] !bg-[rgba(255,255,255,0.03)] !text-[#f1f5f9]">
              <SelectValue placeholder="Seleccione">
                {tempParroquia && parroquiasRaw ? parroquiasRaw.find(p => p.id === Number(tempParroquia))?.parroquia : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(parroquiasRaw ?? []).map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>{p.parroquia}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          disabled={!canAdd}
          onClick={handleAdd}
          className="!rounded-xl bg-gradient-to-r from-[#0b3c91] to-[#1e6bff] text-white disabled:opacity-40"
        >
          <Plus className="mr-1 size-4" weight="bold" />
          Agregar ubicación
        </Button>
      </div>

      {items.length > 0 && (
        <div className="flex flex-col gap-2 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3">
          <p className="px-1 text-xs font-semibold text-[#64748b]">
            Ubicaciones agregadas ({items.length})
          </p>
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-sm text-[#94a3b8]"
            >
              <span>
                {estadoLabel(item.estadoId)} · {municipioLabel(item.municipioId)} · {parroquiaLabel(item.parroquiaId)}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="flex size-6 items-center justify-center rounded-lg text-[#64748b] transition-colors hover:bg-[rgba(239,68,68,0.1)] hover:text-[#ef4444]"
              >
                <X size={14} weight="bold" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

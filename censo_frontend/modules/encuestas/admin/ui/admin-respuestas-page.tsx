"use client";

import useSWR from "swr";
import { fetchTodasRespuestasAction } from "../infrastructure/actions/admin-actions";
import { Skeleton } from "@/shared/ui/components/skeleton";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/shared/ui/components/empty";
import { CloudArrowDown } from "@phosphor-icons/react";
import { motion } from "motion/react";

export function AdminRespuestasPage() {
  const { data, error, isLoading } = useSWR("admin-respuestas", fetchTodasRespuestasAction);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-64 w-full rounded-2xl bg-[rgba(255,255,255,0.04)]" />
      </div>
    );
  }

  if (error) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle className="text-[#f1f5f9]">Error al cargar</EmptyTitle>
          <EmptyDescription className="text-[#64748b]">No se pudieron cargar las respuestas.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle className="text-[#f1f5f9]">Sin respuestas</EmptyTitle>
          <EmptyDescription className="text-[#64748b]">No hay respuestas registradas aún.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#f1f5f9]">Todas las Respuestas</h1>
        <a href="/api/encuestas/exportar-excel" download>
          <button className="flex items-center gap-2.5 rounded-2xl border border-[rgba(30,107,255,0.2)] bg-[rgba(30,107,255,0.08)] px-5 py-3 text-sm font-bold text-[#60a5fa] transition-all duration-300 hover:bg-[rgba(30,107,255,0.15)] hover:-translate-y-[2px]">
            <CloudArrowDown className="size-4" weight="bold" />
            Exportar Excel
          </button>
        </a>
      </div>

      {data.map((usuario, ui) => (
        <motion.div
          key={usuario.usuario.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: ui * 0.05 }}
          className="glass-card overflow-hidden !rounded-2xl !p-0"
        >
          <div className="border-b border-[rgba(255,255,255,0.06)] px-6 py-5">
            <h2 className="text-base font-extrabold text-[#f1f5f9]">
              {usuario.usuario.nombre_empresa}
            </h2>
            <p className="mt-1 text-sm text-[#64748b]">
              {usuario.usuario.email} · <span className="font-mono">{usuario.usuario.rif_empresa}</span>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table w-full border-collapse">
              <thead>
                <tr>
                  <th className="bg-[rgba(30,107,255,0.1)] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.5px] text-[#60a5fa] border-b border-[rgba(30,107,255,0.2)] whitespace-nowrap">Código</th>
                  <th className="bg-[rgba(30,107,255,0.1)] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.5px] text-[#60a5fa] border-b border-[rgba(30,107,255,0.2)] whitespace-nowrap">Pregunta</th>
                  <th className="bg-[rgba(30,107,255,0.1)] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.5px] text-[#60a5fa] border-b border-[rgba(30,107,255,0.2)] whitespace-nowrap">Tipo</th>
                  <th className="bg-[rgba(30,107,255,0.1)] px-4 py-4 text-left text-[11px] font-bold uppercase tracking-[0.5px] text-[#60a5fa] border-b border-[rgba(30,107,255,0.2)] whitespace-nowrap">Respuesta</th>
                </tr>
              </thead>
              <tbody>
                {usuario.respuestas.map((r) => (
                  <tr key={r.pregunta_id} className="border-b border-[rgba(255,255,255,0.06)] transition-all duration-200 hover:bg-[rgba(30,107,255,0.08)]">
                    <td className="px-4 py-3.5 text-xs font-mono text-[#94a3b8] whitespace-nowrap">{r.codigo}</td>
                    <td className="max-w-xs truncate px-4 py-3.5 text-sm text-[#94a3b8]">{r.enunciado}</td>
                    <td className="px-4 py-3.5 text-sm text-[#94a3b8] whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold border ${
                        r.tipo === "seleccion" ? "border-[rgba(30,107,255,0.2)] bg-[rgba(30,107,255,0.08)] text-[#60a5fa]"
                        : r.tipo === "texto" || r.tipo === "texto largo" ? "border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.08)] text-[#22c55e]"
                        : r.tipo === "entero" || r.tipo === "decimal" ? "border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.08)] text-[#f59e0b]"
                        : "border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[#94a3b8]"
                      }`}>{r.tipo}</span>
                    </td>
                    <td className="max-w-[300px] truncate px-4 py-3.5 text-sm text-[#f1f5f9] whitespace-nowrap">
                      {typeof r.respuesta === "object" && r.respuesta !== null
                        ? JSON.stringify(r.respuesta)
                        : String(r.respuesta ?? "—")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

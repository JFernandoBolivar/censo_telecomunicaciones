"use client";

import useSWR from "swr";
import { fetchUsuariosAction } from "../infrastructure/actions/admin-actions";
import { Skeleton } from "@/shared/ui/components/skeleton";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/shared/ui/components/empty";
import { motion } from "motion/react";

export function AdminUsuariosPage() {
  const { data, error, isLoading } = useSWR("admin-usuarios", fetchUsuariosAction);

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-2xl bg-[rgba(255,255,255,0.04)]" />;
  }

  if (error) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle className="text-[#f1f5f9]">Error al cargar</EmptyTitle>
          <EmptyDescription className="text-[#64748b]">No se pudieron cargar los usuarios.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle className="text-[#f1f5f9]">Sin usuarios</EmptyTitle>
          <EmptyDescription className="text-[#64748b]">No hay usuarios registrados aún.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold tracking-tight text-[#f1f5f9]">Usuarios Registrados</h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden !rounded-2xl !p-0"
      >
        <div className="overflow-x-auto">
          <table className="data-table w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-[rgba(30,107,255,0.1)] px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.5px] text-[#60a5fa] border-b border-[rgba(30,107,255,0.2)] whitespace-nowrap">Email</th>
                <th className="bg-[rgba(30,107,255,0.1)] px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.5px] text-[#60a5fa] border-b border-[rgba(30,107,255,0.2)] whitespace-nowrap">Empresa</th>
                <th className="bg-[rgba(30,107,255,0.1)] px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.5px] text-[#60a5fa] border-b border-[rgba(30,107,255,0.2)] whitespace-nowrap">RIF</th>
                <th className="bg-[rgba(30,107,255,0.1)] px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.5px] text-[#60a5fa] border-b border-[rgba(30,107,255,0.2)] whitespace-nowrap">Estado</th>
                <th className="bg-[rgba(30,107,255,0.1)] px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.5px] text-[#60a5fa] border-b border-[rgba(30,107,255,0.2)] whitespace-nowrap">Staff</th>
                <th className="bg-[rgba(30,107,255,0.1)] px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.5px] text-[#60a5fa] border-b border-[rgba(30,107,255,0.2)] whitespace-nowrap">Registro</th>
              </tr>
            </thead>
            <tbody>
              {data.map((u) => (
                <tr key={u.id} className="border-b border-[rgba(255,255,255,0.06)] transition-all duration-200 hover:bg-[rgba(30,107,255,0.08)]">
                  <td className="px-5 py-3.5 text-sm text-[#f1f5f9] whitespace-nowrap">{u.email}</td>
                  <td className="px-5 py-3.5 text-sm text-[#94a3b8] whitespace-nowrap">{u.nombreEmpresa}</td>
                  <td className="px-5 py-3.5 text-xs font-mono text-[#94a3b8] whitespace-nowrap">{u.rifEmpresa}</td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold border ${
                      u.isActive
                        ? "border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.08)] text-[#22c55e]"
                        : "border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.08)] text-[#ef4444]"
                    }`}>
                      {u.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#94a3b8] whitespace-nowrap">{u.isStaff ? "Sí" : "No"}</td>
                  <td className="px-5 py-3.5 text-xs text-[#64748b] whitespace-nowrap">
                    {new Date(u.fechaCreacion).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

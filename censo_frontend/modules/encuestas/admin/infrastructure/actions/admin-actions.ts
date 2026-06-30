"use server";

import { getTodasRespuestas, getUsuarios } from "../http/admin-api";

export async function fetchTodasRespuestasAction() {
  return getTodasRespuestas();
}

export async function fetchUsuariosAction() {
  const raw = await getUsuarios();
  return raw.map((u) => ({
    id: u.id,
    email: u.email,
    nombreEmpresa: u.nombre_empresa,
    rifEmpresa: u.rif_empresa,
    isActive: u.is_active,
    isStaff: u.is_staff,
    fechaCreacion: u.fecha_creacion,
  }));
}

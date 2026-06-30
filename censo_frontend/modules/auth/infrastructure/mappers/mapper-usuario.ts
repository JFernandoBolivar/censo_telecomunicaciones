import type { UsuarioEntity } from "../../domain/entities/usuario-entity";
import { createUsuarioEntity } from "../../domain/entities/usuario-entity";
import { crearEmailVO } from "../../domain/value-objects/email-vo";
import { crearRifEmpresaVO } from "../../domain/value-objects/rif-empresa-vo";

interface UsuarioRaw {
  id: number;
  email: string;
  nombre_empresa: string;
  rif_empresa: string;
  is_active: boolean;
  is_staff: boolean;
}

export function mapperUsuario(raw: UsuarioRaw): UsuarioEntity {
  return createUsuarioEntity({
    id: raw.id,
    email: crearEmailVO(raw.email),
    nombreEmpresa: raw.nombre_empresa,
    rifEmpresa: crearRifEmpresaVO(raw.rif_empresa),
    isActive: raw.is_active,
    isStaff: raw.is_staff,
  });
}

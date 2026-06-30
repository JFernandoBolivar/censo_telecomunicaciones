import type { EmailVO } from "../value-objects/email-vo";
import type { RifEmpresaVO } from "../value-objects/rif-empresa-vo";

export interface UsuarioEntity {
  readonly id: number;
  readonly email: EmailVO;
  readonly nombreEmpresa: string;
  readonly rifEmpresa: RifEmpresaVO;
  readonly isActive: boolean;
  readonly isStaff: boolean;
}

export function createUsuarioEntity(params: {
  id: number;
  email: EmailVO;
  nombreEmpresa: string;
  rifEmpresa: RifEmpresaVO;
  isActive: boolean;
  isStaff: boolean;
}): UsuarioEntity {
  if (!params.nombreEmpresa.trim()) {
    throw new Error("Usuario: nombre de empresa requerido");
  }
  return { ...params };
}

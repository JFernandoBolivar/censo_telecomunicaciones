import type { UsuarioEntity } from "../entities/usuario-entity";

export interface RegisterInput {
  email: string;
  nombreEmpresa: string;
  rifEmpresa: string;
  password: string;
}

export interface AuthResult {
  access: string;
  refresh: string;
  user: UsuarioEntity;
}

export interface RepoAuth {
  register(input: RegisterInput): Promise<AuthResult>;
}

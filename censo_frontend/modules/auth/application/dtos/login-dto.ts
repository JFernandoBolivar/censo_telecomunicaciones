export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  nombreEmpresa: string;
  rifEmpresa: string;
  password: string;
}

export interface UsuarioItemDTO {
  id: number;
  email: string;
  nombreEmpresa: string;
  rifEmpresa: string;
  isActive: boolean;
  isStaff: boolean;
}

export interface AuthResultDTO {
  access: string;
  refresh: string;
  user: UsuarioItemDTO;
}

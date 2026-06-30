export interface AdminRespuestaDTO {
  id: number;
  titulo: string;
  tipo: string;
  respuesta: string;
}

export interface UsuarioItemDTO {
  id: number;
  email: string;
  nombreEmpresa: string;
  rifEmpresa: string;
  isActive: boolean;
  isStaff: boolean;
  fechaCreacion: string;
}

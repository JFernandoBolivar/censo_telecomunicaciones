export interface EstadoEntity {
  readonly id: number;
  readonly estado: string;
}

export function createEstadoEntity(data: { id: number; estado: string }): EstadoEntity {
  if (!data.estado.trim()) throw new Error("Estado: nombre requerido");
  return { id: data.id, estado: data.estado };
}

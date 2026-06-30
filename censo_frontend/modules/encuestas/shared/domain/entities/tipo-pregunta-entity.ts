export interface TipoPreguntaEntity {
  readonly id: number;
  readonly nombre: string;
}

export function createTipoPreguntaEntity(data: { id: number; nombre: string }): TipoPreguntaEntity {
  if (!data.nombre.trim()) throw new Error("TipoPregunta: nombre requerido");
  return { id: data.id, nombre: data.nombre };
}

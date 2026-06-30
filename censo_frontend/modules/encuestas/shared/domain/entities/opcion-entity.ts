export interface OpcionEntity {
  readonly id: number;
  readonly opcion: string;
}

export function createOpcionEntity(data: { id: number; opcion: string }): OpcionEntity {
  if (!data.opcion.trim()) throw new Error("Opcion: texto requerido");
  return { id: data.id, opcion: data.opcion };
}

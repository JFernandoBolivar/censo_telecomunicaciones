export interface SeccionEntity {
  readonly id: number;
  readonly seccion: string;
}

export function createSeccionEntity(data: { id: number; seccion: string }): SeccionEntity {
  if (!data.seccion.trim()) throw new Error("Seccion: nombre requerido");
  return { id: data.id, seccion: data.seccion };
}

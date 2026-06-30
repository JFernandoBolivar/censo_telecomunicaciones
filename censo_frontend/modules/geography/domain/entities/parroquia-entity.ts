export interface ParroquiaEntity {
  readonly id: number;
  readonly parroquia: string;
}

export function createParroquiaEntity(data: { id: number; parroquia: string }): ParroquiaEntity {
  if (!data.parroquia.trim()) throw new Error("Parroquia: nombre requerido");
  return { id: data.id, parroquia: data.parroquia };
}

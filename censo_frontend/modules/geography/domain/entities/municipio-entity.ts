export interface MunicipioEntity {
  readonly id: number;
  readonly municipio: string;
}

export function createMunicipioEntity(data: { id: number; municipio: string }): MunicipioEntity {
  if (!data.municipio.trim()) throw new Error("Municipio: nombre requerido");
  return { id: data.id, municipio: data.municipio };
}

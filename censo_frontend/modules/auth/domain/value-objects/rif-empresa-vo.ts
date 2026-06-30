export type RifEmpresaVO = {
  readonly value: string;
};

export function crearRifEmpresaVO(valor: string): RifEmpresaVO {
  const rif = valor.trim().toUpperCase();
  if (!/^[JVE]-?\d{6,9}-?\d$/.test(rif)) {
    throw new Error("RIF inválido: formato incorrecto");
  }
  return { value: rif };
}

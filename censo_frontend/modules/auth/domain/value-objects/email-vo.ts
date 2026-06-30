export type EmailVO = {
  readonly value: string;
};

export function crearEmailVO(valor: string): EmailVO {
  const email = valor.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Email inválido: formato incorrecto");
  }
  return { value: email };
}

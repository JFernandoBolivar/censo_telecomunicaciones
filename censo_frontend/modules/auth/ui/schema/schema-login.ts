import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type LoginFormType = z.infer<typeof signInSchema>;

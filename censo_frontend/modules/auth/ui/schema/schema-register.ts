import { z } from "zod";

export const registerFormSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  nombreEmpresa: z.string().min(2, "Mínimo 2 caracteres"),
  rifEmpresa: z.string().min(5, "RIF inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  confirmarPassword: z.string(),
}).refine((d) => d.password === d.confirmarPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmarPassword"],
});

export type RegisterFormType = z.infer<typeof registerFormSchema>;

import { z } from "zod";

export const respuestaFormSchema = z.object({
  respuestas: z.array(
    z.object({
      pregunta: z.number(),
      opcion: z.number().nullable().optional(),
      respuesta: z.string().optional(),
    }),
  ),
});

export type RespuestaFormType = z.infer<typeof respuestaFormSchema>;

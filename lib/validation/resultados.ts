import { z } from "zod";

export const lancarResultadoSchema = z.object({
  jogoId: z.string().min(1),
  placarCasa: z.coerce.number().int().min(0).max(99),
  placarVisitante: z.coerce.number().int().min(0).max(99),
});

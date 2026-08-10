import { z } from "zod";

export const criarJogoSchema = z
  .object({
    etapaId: z.string().min(1, "Selecione a etapa"),
    timeCasaId: z.string().min(1, "Selecione o time da casa"),
    timeVisitanteId: z.string().min(1, "Selecione o time visitante"),
    dataHora: z.string().min(1, "Informe a data e hora"),
  })
  .refine((data) => data.timeCasaId !== data.timeVisitanteId, {
    message: "Os times devem ser diferentes",
    path: ["timeVisitanteId"],
  });

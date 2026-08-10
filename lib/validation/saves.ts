import { z } from "zod";
import { uniformeFields } from "./uniforme";

export const criarSaveSchema = z.object({
  nome: z.string().trim().min(2, "Nome muito curto").max(80),
});

export const entrarComCodigoSchema = z.object({
  codigo: z
    .string()
    .trim()
    .min(4, "Código inválido")
    .max(12)
    .transform((v) => v.toUpperCase()),
});

export const criarTemporadaSchema = z.object({
  nome: z.string().trim().min(2, "Nome muito curto").max(80),
});

export const criarTimeSchema = z
  .object({
    nome: z.string().trim().min(1, "Nome muito curto").max(80),
    ...uniformeFields,
  })
  .refine((data) => data.padraoUniforme === "SOLIDO" || data.cores.length >= 2, {
    message: "Escolha ao menos 2 cores para usar um padrão de listras",
    path: ["cores"],
  });

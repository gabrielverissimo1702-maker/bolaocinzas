import { z } from "zod";

const corHex = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida");

export const uniformeFields = {
  sigla: z
    .string()
    .trim()
    .min(2, "Sigla deve ter 2 a 4 letras")
    .max(4, "Sigla deve ter no máximo 4 letras")
    .transform((v) => v.toUpperCase()),
  cores: z.array(corHex).min(1, "Escolha ao menos 1 cor").max(4, "No máximo 4 cores"),
  padraoUniforme: z.enum([
    "SOLIDO",
    "LISTRAS_VERTICAIS",
    "LISTRAS_HORIZONTAIS",
    "LISTRAS_DIAGONAIS",
    "MANGAS_CONTRASTANTES",
    "GOLA_CONTRASTANTE",
    "BICOLOR",
    "DEGRADE",
  ]),
};

export const uniformeSchema = z
  .object(uniformeFields)
  .refine((data) => data.padraoUniforme === "SOLIDO" || data.cores.length >= 2, {
    message: "Escolha ao menos 2 cores para usar um padrão de listras",
    path: ["cores"],
  });

export const perfilSchema = z
  .object({
    nome: z.string().trim().min(2, "Nome muito curto").max(80),
    ...uniformeFields,
  })
  .refine((data) => data.padraoUniforme === "SOLIDO" || data.cores.length >= 2, {
    message: "Escolha ao menos 2 cores para usar um padrão de listras",
    path: ["cores"],
  });

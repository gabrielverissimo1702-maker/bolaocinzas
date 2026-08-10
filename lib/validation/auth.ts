import { z } from "zod";
import { uniformeFields } from "./uniforme";

export const cadastroSchema = z
  .object({
    nome: z.string().trim().min(2, "Nome muito curto").max(80),
    email: z.string().trim().email("Email inválido").toLowerCase(),
    senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres").max(100),
    ...uniformeFields,
  })
  .refine((data) => data.padraoUniforme === "SOLIDO" || data.cores.length >= 2, {
    message: "Escolha ao menos 2 cores para usar um padrão de listras",
    path: ["cores"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email("Email inválido").toLowerCase(),
  senha: z.string().min(1, "Informe a senha"),
});

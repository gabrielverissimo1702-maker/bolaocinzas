import { z } from "zod";

const base = {
  nome: z.string().trim().min(2, "Nome muito curto").max(80),
  pontosCravada: z.coerce.number().int().min(0).max(1000),
  pontosAcerto: z.coerce.number().int().min(0).max(1000),
};

const criterioDesempateEnum = z.enum([
  "JOGO_EXTRA",
  "MAIS_CRAVADAS",
  "MAIS_ACERTOS",
  "SORTEIO_DIRETO",
]);

export const criarLigaSchema = z.object({
  tipo: z.literal("LIGA"),
  ...base,
  numeroRodadas: z.coerce.number().int().min(1).max(100),
  jogosPorRodada: z.coerce.number().int().min(1).max(50),
});

export const criarCopaSchema = z.object({
  tipo: z.literal("COPA"),
  ...base,
  numeroParticipantes: z.coerce.number().int().min(2).max(512),
  jogosPorFase: z.coerce.number().int().min(1).max(50),
  criterioDesempate: criterioDesempateEnum,
  formaGeracaoConfrontos: z.enum(["SORTEIO", "MANUAL", "HIBRIDO"]),
});

export const criarSupercopaSchema = z.object({
  tipo: z.literal("SUPERCOPA"),
  ...base,
  numeroParticipantes: z.coerce.number().int().min(2).max(4),
  numeroJogos: z.coerce.number().int().min(1).max(20),
  criterioDesempate: criterioDesempateEnum,
  formaGeracaoConfrontos: z.enum(["SORTEIO", "MANUAL", "HIBRIDO"]),
});

export const criarCompeticaoSchema = z.discriminatedUnion("tipo", [
  criarLigaSchema,
  criarCopaSchema,
  criarSupercopaSchema,
]);

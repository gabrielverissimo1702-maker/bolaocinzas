"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth/session";
import { requireSaveOwner } from "@/lib/auth/authorization";
import { lancarResultadoSchema } from "@/lib/validation/resultados";
import { recalcularPalpitesDoJogo } from "@/lib/scoring/recalcularPalpitesDoJogo";

export type ResultadosActionState = { error?: string };

export async function lancarResultado(
  saveId: string,
  _prevState: ResultadosActionState,
  formData: FormData
): Promise<ResultadosActionState> {
  const usuario = await requireUsuario();
  await requireSaveOwner(saveId, usuario.id);

  const parsed = lancarResultadoSchema.safeParse({
    jogoId: formData.get("jogoId"),
    placarCasa: formData.get("placarCasa"),
    placarVisitante: formData.get("placarVisitante"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const jogo = await prisma.jogo.findUnique({
    where: { id: parsed.data.jogoId },
    include: { etapa: { include: { competicao: true } } },
  });
  if (!jogo || jogo.etapa.competicao.temporadaId == null) {
    return { error: "Jogo não encontrado" };
  }

  await prisma.jogo.update({
    where: { id: parsed.data.jogoId },
    data: { placarCasa: parsed.data.placarCasa, placarVisitante: parsed.data.placarVisitante },
  });

  await recalcularPalpitesDoJogo(parsed.data.jogoId);

  const { temporadaId, id: competicaoId } = jogo.etapa.competicao;
  revalidatePath(`/admin/saves/${saveId}/temporadas/${temporadaId}/competicoes/${competicaoId}`);
  revalidatePath(`/usuario/competicoes/${competicaoId}/classificacao`);
  revalidatePath(`/usuario/competicoes/${competicaoId}/palpites`);

  return {};
}

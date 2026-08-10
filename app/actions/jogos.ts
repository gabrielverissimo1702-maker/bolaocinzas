"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth/session";
import { requireSaveOwner } from "@/lib/auth/authorization";
import { criarJogoSchema } from "@/lib/validation/jogos";

export type JogosActionState = { error?: string };

export async function criarJogo(
  _prevState: JogosActionState,
  formData: FormData
): Promise<JogosActionState> {
  const usuario = await requireUsuario();
  const saveId = String(formData.get("saveId") ?? "");
  const temporadaId = String(formData.get("temporadaId") ?? "");
  const competicaoId = String(formData.get("competicaoId") ?? "");
  await requireSaveOwner(saveId, usuario.id);

  const parsed = criarJogoSchema.safeParse({
    etapaId: formData.get("etapaId"),
    timeCasaId: formData.get("timeCasaId"),
    timeVisitanteId: formData.get("timeVisitanteId"),
    dataHora: formData.get("dataHora"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const etapa = await prisma.etapa.findUnique({
    where: { id: parsed.data.etapaId },
    include: { competicao: true },
  });
  if (!etapa || etapa.competicaoId !== competicaoId || etapa.competicao.temporadaId !== temporadaId) {
    return { error: "Etapa inválida" };
  }

  const [timeCasa, timeVisitante] = await Promise.all([
    prisma.time.findUnique({ where: { id: parsed.data.timeCasaId } }),
    prisma.time.findUnique({ where: { id: parsed.data.timeVisitanteId } }),
  ]);
  if (!timeCasa || timeCasa.saveId !== saveId || !timeVisitante || timeVisitante.saveId !== saveId) {
    return { error: "Time inválido" };
  }

  await prisma.jogo.create({
    data: {
      etapaId: parsed.data.etapaId,
      timeCasaId: parsed.data.timeCasaId,
      timeVisitanteId: parsed.data.timeVisitanteId,
      dataHora: new Date(parsed.data.dataHora),
    },
  });

  revalidatePath(`/admin/saves/${saveId}/temporadas/${temporadaId}/competicoes/${competicaoId}`);
  return {};
}

export async function removerJogo(jogoId: string, saveId: string, temporadaId: string, competicaoId: string) {
  const usuario = await requireUsuario();
  await requireSaveOwner(saveId, usuario.id);

  await prisma.jogo.delete({ where: { id: jogoId } });

  revalidatePath(`/admin/saves/${saveId}/temporadas/${temporadaId}/competicoes/${competicaoId}`);
  revalidatePath("/admin/atualizar");
}

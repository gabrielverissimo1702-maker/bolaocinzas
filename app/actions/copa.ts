"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth/session";
import { requireSaveOwner } from "@/lib/auth/authorization";
import { calcularByes } from "@/lib/copa/byes";
import { gerarChaveamento, fecharEtapa } from "@/lib/copa/bracket";

export type CopaActionState = { error?: string };

function shuffle<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export async function gerarConfrontosCopa(
  saveId: string,
  temporadaId: string,
  competicaoId: string,
  _prevState: CopaActionState,
  formData: FormData
): Promise<CopaActionState> {
  const usuario = await requireUsuario();
  await requireSaveOwner(saveId, usuario.id);

  const competicao = await prisma.competicao.findUnique({ where: { id: competicaoId } });
  if (
    !competicao ||
    (competicao.tipo !== "COPA" && competicao.tipo !== "SUPERCOPA") ||
    competicao.temporadaId !== temporadaId
  ) {
    return { error: "Competição inválida" };
  }
  if (!competicao.numeroParticipantes) return { error: "Competição sem número de participantes definido" };

  const existentes = await prisma.copaConfronto.count({ where: { etapa: { competicaoId } } });
  if (existentes > 0) return { error: "O chaveamento desta competição já foi gerado" };

  const usuarioIds = formData.getAll("participantes").map(String);
  if (usuarioIds.length !== competicao.numeroParticipantes) {
    return {
      error: `Selecione exatamente ${competicao.numeroParticipantes} participante(s) (selecionados: ${usuarioIds.length})`,
    };
  }

  const copaParticipantes = await prisma.$transaction(
    usuarioIds.map((usuarioId) =>
      prisma.copaParticipante.upsert({
        where: { competicaoId_usuarioId: { competicaoId, usuarioId } },
        create: { competicaoId, usuarioId },
        update: {},
      })
    )
  );

  const { numByes } = calcularByes(usuarioIds.length);
  const porUsuario = new Map(copaParticipantes.map((p) => [p.usuarioId, p.id]));

  let participantesEmOrdem: string[];

  if (competicao.formaGeracaoConfrontos === "MANUAL") {
    const posicoes = usuarioIds.map((usuarioId) => ({
      usuarioId,
      posicao: Number(formData.get(`posicao_${usuarioId}`) ?? 0),
    }));
    if (posicoes.some((p) => !p.posicao || p.posicao < 1)) {
      return { error: "Defina uma posição válida (1 a N) para todos os participantes" };
    }
    const posicoesUnicas = new Set(posicoes.map((p) => p.posicao));
    if (posicoesUnicas.size !== posicoes.length) {
      return { error: "As posições devem ser únicas" };
    }
    posicoes.sort((a, b) => a.posicao - b.posicao);
    participantesEmOrdem = posicoes.map((p) => porUsuario.get(p.usuarioId)!);
  } else if (competicao.formaGeracaoConfrontos === "HIBRIDO") {
    const byeUsuarioIds = usuarioIds.filter((id) => formData.get(`bye_${id}`) === "on");
    if (byeUsuarioIds.length !== numByes) {
      return { error: `Marque exatamente ${numByes} participante(s) para receber bye` };
    }
    const restantes = shuffle(usuarioIds.filter((id) => !byeUsuarioIds.includes(id)));
    participantesEmOrdem = [...byeUsuarioIds, ...restantes].map((id) => porUsuario.get(id)!);
  } else {
    participantesEmOrdem = shuffle(usuarioIds).map((id) => porUsuario.get(id)!);
  }

  await gerarChaveamento(competicaoId, participantesEmOrdem);

  revalidatePath(`/admin/saves/${saveId}/temporadas/${temporadaId}/competicoes/${competicaoId}`);
  redirect(`/admin/saves/${saveId}/temporadas/${temporadaId}/competicoes/${competicaoId}`);
}

export async function atribuirParticipanteSlot(
  saveId: string,
  confrontoId: string,
  slot: "A" | "B",
  copaParticipanteId: string | null
): Promise<{ error?: string }> {
  const usuario = await requireUsuario();
  await requireSaveOwner(saveId, usuario.id);

  const confronto = await prisma.copaConfronto.findUniqueOrThrow({
    where: { id: confrontoId },
    include: { etapa: { include: { competicao: true } } },
  });

  if (copaParticipanteId) {
    const participante = await prisma.copaParticipante.findUnique({ where: { id: copaParticipanteId } });
    if (!participante || participante.competicaoId !== confronto.etapa.competicaoId) {
      return { error: "Participante não pertence a esta competição" };
    }

    const jaAlocado = await prisma.copaConfronto.findFirst({
      where: {
        id: { not: confrontoId },
        etapa: { competicaoId: confronto.etapa.competicaoId },
        OR: [{ participanteAId: copaParticipanteId }, { participanteBId: copaParticipanteId }],
      },
    });
    if (jaAlocado) {
      return { error: "Este participante já está em outro confronto do chaveamento" };
    }
  }

  await prisma.copaConfronto.update({
    where: { id: confrontoId },
    data: slot === "A" ? { participanteAId: copaParticipanteId } : { participanteBId: copaParticipanteId },
  });

  revalidatePath(
    `/admin/saves/${saveId}/temporadas/${confronto.etapa.competicao.temporadaId}/competicoes/${confronto.etapa.competicaoId}`
  );
  return {};
}

export async function fecharEtapaCopa(saveId: string, etapaId: string) {
  const usuario = await requireUsuario();
  await requireSaveOwner(saveId, usuario.id);

  const etapa = await prisma.etapa.findUniqueOrThrow({
    where: { id: etapaId },
    include: { competicao: true },
  });

  const resultado = await fecharEtapa(etapaId);

  revalidatePath(
    `/admin/saves/${saveId}/temporadas/${etapa.competicao.temporadaId}/competicoes/${etapa.competicaoId}`
  );
  revalidatePath(`/usuario/competicoes/${etapa.competicaoId}/chaveamento`);

  return resultado;
}

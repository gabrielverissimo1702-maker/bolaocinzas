"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth/session";
import { requireSaveOwner } from "@/lib/auth/authorization";
import { criarCompeticaoSchema } from "@/lib/validation/competicoes";
import { calcularClassificacaoLiga } from "@/lib/scoring/classificacaoLiga";

export type CompeticoesActionState = { error?: string };

export async function criarCompeticao(
  _prevState: CompeticoesActionState,
  formData: FormData
): Promise<CompeticoesActionState> {
  const usuario = await requireUsuario();
  const saveId = String(formData.get("saveId") ?? "");
  const temporadaId = String(formData.get("temporadaId") ?? "");
  await requireSaveOwner(saveId, usuario.id);

  const temporada = await prisma.temporada.findUnique({ where: { id: temporadaId } });
  if (!temporada || temporada.saveId !== saveId) {
    return { error: "Temporada não encontrada" };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = criarCompeticaoSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const dados = parsed.data;

  if (dados.tipo === "LIGA" || dados.tipo === "COPA") {
    const existente = await prisma.competicao.findFirst({ where: { temporadaId, tipo: dados.tipo } });
    if (existente) {
      return {
        error: `Esta temporada já tem uma ${dados.tipo === "LIGA" ? "Liga" : "Copa"} (${existente.nome})`,
      };
    }
  }

  if (dados.tipo === "SUPERCOPA") {
    const existente = await prisma.competicao.findFirst({ where: { temporadaId, tipo: "SUPERCOPA" } });
    if (existente) {
      return { error: `Esta temporada já tem uma Supercopa (${existente.nome})` };
    }
  }

  const competicao = await prisma.competicao.create({
    data: {
      temporadaId,
      tipo: dados.tipo,
      nome: dados.nome,
      pontosCravada: dados.pontosCravada,
      pontosAcerto: dados.pontosAcerto,
      ...(dados.tipo === "LIGA" && {
        numeroRodadas: dados.numeroRodadas,
        jogosPorRodada: dados.jogosPorRodada,
      }),
      ...(dados.tipo === "COPA" && {
        numeroParticipantes: dados.numeroParticipantes,
        jogosPorFase: dados.jogosPorFase,
        criterioDesempate: dados.criterioDesempate,
        formaGeracaoConfrontos: dados.formaGeracaoConfrontos,
      }),
      ...(dados.tipo === "SUPERCOPA" && {
        numeroParticipantes: dados.numeroParticipantes,
        numeroJogos: dados.numeroJogos,
        criterioDesempate: dados.criterioDesempate,
        formaGeracaoConfrontos: dados.formaGeracaoConfrontos,
      }),
    },
  });

  if (dados.tipo === "LIGA") {
    await prisma.etapa.createMany({
      data: Array.from({ length: dados.numeroRodadas }, (_, i) => ({
        competicaoId: competicao.id,
        nome: `Rodada ${i + 1}`,
        ordem: i + 1,
      })),
    });
  }

  revalidatePath(`/admin/saves/${saveId}/temporadas/${temporadaId}`);
  redirect(`/admin/saves/${saveId}/temporadas/${temporadaId}/competicoes/${competicao.id}`);
}

export type EncerrarLigaResultado = { error?: string; campeaoNome?: string };

export async function encerrarLiga(saveId: string, competicaoId: string): Promise<EncerrarLigaResultado> {
  const usuario = await requireUsuario();
  await requireSaveOwner(saveId, usuario.id);

  const competicao = await prisma.competicao.findUniqueOrThrow({ where: { id: competicaoId } });
  if (competicao.tipo !== "LIGA") return { error: "Esta competição não é uma Liga" };
  if (competicao.campeaoUsuarioId) return { error: "Esta Liga já tem campeão definido" };

  const etapas = await prisma.etapa.findMany({ where: { competicaoId }, include: { jogos: true } });
  const semResultado = etapas.some((e) => e.jogos.some((j) => j.placarCasa == null));
  if (semResultado) return { error: "Ainda há jogos sem resultado lançado" };

  const classificacao = await calcularClassificacaoLiga(competicaoId);
  if (classificacao.length === 0) return { error: "Nenhum participante na classificação" };

  const campeao = classificacao[0];
  await prisma.competicao.update({
    where: { id: competicaoId },
    data: { campeaoUsuarioId: campeao.usuarioId, status: "ENCERRADA" },
  });

  revalidatePath(`/admin/saves/${saveId}/temporadas/${competicao.temporadaId}/competicoes/${competicaoId}`);
  return { campeaoNome: campeao.nome };
}

export type StatusActionResult = { error?: string };

export async function iniciarCompeticao(saveId: string, competicaoId: string): Promise<StatusActionResult> {
  const usuario = await requireUsuario();
  await requireSaveOwner(saveId, usuario.id);

  const competicao = await prisma.competicao.findUniqueOrThrow({ where: { id: competicaoId } });
  if (competicao.status !== "RASCUNHO") return { error: "Esta competição já foi iniciada" };

  await prisma.competicao.update({ where: { id: competicaoId }, data: { status: "EM_ANDAMENTO" } });

  revalidatePath(`/admin/saves/${saveId}/temporadas/${competicao.temporadaId}/competicoes/${competicaoId}`);
  return {};
}

// Encerramento manual pra Copa/Supercopa — na prática o chaveamento já encerra
// sozinho quando a final é decidida (ver fecharEtapa); isso serve de fallback
// pro admin, exigindo que já exista campeão definido.
export async function encerrarCopaSupercopa(saveId: string, competicaoId: string): Promise<StatusActionResult> {
  const usuario = await requireUsuario();
  await requireSaveOwner(saveId, usuario.id);

  const competicao = await prisma.competicao.findUniqueOrThrow({ where: { id: competicaoId } });
  if (competicao.tipo === "LIGA") return { error: "Esta competição é uma Liga" };
  if (competicao.status === "ENCERRADA") return { error: "Esta competição já está encerrada" };
  if (!competicao.campeaoUsuarioId) return { error: "Ainda não há campeão definido no chaveamento" };

  await prisma.competicao.update({ where: { id: competicaoId }, data: { status: "ENCERRADA" } });

  revalidatePath(`/admin/saves/${saveId}/temporadas/${competicao.temporadaId}/competicoes/${competicaoId}`);
  return {};
}

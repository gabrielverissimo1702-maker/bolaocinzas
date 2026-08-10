"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth/session";
import { requireSaveOwner } from "@/lib/auth/authorization";
import { lancarResultadoSchema } from "@/lib/validation/resultados";
import { recalcularPalpitesDoJogo } from "@/lib/scoring/recalcularPalpitesDoJogo";

export type ResultadosActionState = { error?: string };
export type AtualizarJogosState = { error?: string; success?: boolean };

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

export async function atualizarJogosLote(
  _prevState: AtualizarJogosState,
  formData: FormData
): Promise<AtualizarJogosState> {
  const usuario = await requireUsuario();

  const jogoIds = formData.getAll("jogoId").map(String);
  if (jogoIds.length === 0) return { error: "Nenhum jogo para salvar" };

  const jogos = await prisma.jogo.findMany({
    where: { id: { in: jogoIds } },
    include: {
      timeCasa: true,
      timeVisitante: true,
      etapa: { include: { competicao: { include: { temporada: { include: { save: true } } } } } },
    },
  });
  if (jogos.length === 0) return { error: "Jogos não encontrados" };

  for (const jogo of jogos) {
    if (jogo.etapa.competicao.temporada.save.criadorId !== usuario.id) {
      return { error: "Você não tem permissão para editar um desses jogos" };
    }
  }

  const competicaoIdsAfetados = new Set<string>();
  const jogosComPlacarAlterado: string[] = [];
  const operacoes: ReturnType<typeof prisma.jogo.update>[] = [];

  for (const jogo of jogos) {
    const rawCasa = formData.get(`placarCasa_${jogo.id}`);
    const rawVisitante = formData.get(`placarVisitante_${jogo.id}`);
    const rawDataHora = formData.get(`dataHora_${jogo.id}`);

    const data: { placarCasa?: number; placarVisitante?: number; dataHora?: Date } = {};

    if (rawCasa != null && rawVisitante != null && rawCasa !== "" && rawVisitante !== "") {
      const placarCasa = Number(rawCasa);
      const placarVisitante = Number(rawVisitante);
      if (
        !Number.isInteger(placarCasa) ||
        !Number.isInteger(placarVisitante) ||
        placarCasa < 0 ||
        placarVisitante < 0 ||
        placarCasa > 99 ||
        placarVisitante > 99
      ) {
        return { error: `Placar inválido em ${jogo.timeCasa.nome} x ${jogo.timeVisitante.nome}` };
      }
      if (placarCasa !== jogo.placarCasa || placarVisitante !== jogo.placarVisitante) {
        data.placarCasa = placarCasa;
        data.placarVisitante = placarVisitante;
        jogosComPlacarAlterado.push(jogo.id);
      }
    }

    if (typeof rawDataHora === "string" && rawDataHora !== "") {
      const novaData = new Date(rawDataHora);
      if (!Number.isNaN(novaData.getTime()) && novaData.getTime() !== new Date(jogo.dataHora).getTime()) {
        data.dataHora = novaData;
      }
    }

    if (Object.keys(data).length > 0) {
      operacoes.push(prisma.jogo.update({ where: { id: jogo.id }, data }));
      competicaoIdsAfetados.add(jogo.etapa.competicaoId);
    }
  }

  if (operacoes.length === 0) return { error: "Nenhuma alteração para salvar" };

  await prisma.$transaction(operacoes);

  for (const jogoId of jogosComPlacarAlterado) {
    await recalcularPalpitesDoJogo(jogoId);
  }

  revalidatePath("/admin/atualizar");
  for (const competicaoId of competicaoIdsAfetados) {
    revalidatePath(`/usuario/competicoes/${competicaoId}/classificacao`);
    revalidatePath(`/usuario/competicoes/${competicaoId}/palpites`);
  }
  revalidatePath("/usuario", "layout");
  revalidatePath("/", "layout");

  return { success: true };
}

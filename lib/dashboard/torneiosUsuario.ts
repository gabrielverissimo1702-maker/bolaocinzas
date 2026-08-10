import { prisma } from "@/lib/prisma";

export interface TorneioResumo {
  competicaoId: string;
  tipo: "LIGA" | "COPA" | "SUPERCOPA";
  saveNome: string;
  competicaoNome: string;
  faseAtual: string | null;
  enviados: number;
  total: number;
  eliminado: boolean;
  dataInicio: Date | null;
  dataFinal: Date | null;
  encerrada: boolean;
  href: string;
}

const HREF_POR_TIPO: Record<TorneioResumo["tipo"], (id: string) => string> = {
  LIGA: (id) => `/usuario/competicoes/${id}/classificacao`,
  COPA: (id) => `/usuario/competicoes/${id}/chaveamento`,
  SUPERCOPA: (id) => `/usuario/competicoes/${id}/supercopa`,
};

function minMaxData(jogos: { dataHora: Date }[]): { inicio: Date | null; final: Date | null } {
  if (jogos.length === 0) return { inicio: null, final: null };
  const tempos = jogos.map((j) => j.dataHora.getTime());
  return { inicio: new Date(Math.min(...tempos)), final: new Date(Math.max(...tempos)) };
}

async function torneioLiga(
  competicaoId: string,
  nome: string,
  saveNome: string,
  usuarioId: string,
  encerrada: boolean
): Promise<TorneioResumo> {
  const etapas = await prisma.etapa.findMany({
    where: { competicaoId },
    orderBy: { ordem: "asc" },
    include: { jogos: true },
  });

  const etapasComJogos = etapas.filter((e) => e.jogos.length > 0);
  const indexAtual = etapasComJogos.findIndex((e) => e.jogos.some((j) => j.placarCasa == null));
  const etapaAtual = indexAtual >= 0 ? etapasComJogos[indexAtual] : etapasComJogos[etapasComJogos.length - 1];

  const jogos = etapaAtual?.jogos ?? [];
  const enviados = etapaAtual
    ? await prisma.palpite.count({ where: { usuarioId, jogo: { etapaId: etapaAtual.id } } })
    : 0;
  const { inicio, final } = minMaxData(jogos);

  return {
    competicaoId,
    tipo: "LIGA",
    saveNome,
    competicaoNome: nome,
    faseAtual: etapaAtual?.nome ?? null,
    enviados,
    total: jogos.length,
    eliminado: false,
    dataInicio: inicio,
    dataFinal: final,
    encerrada,
    href: HREF_POR_TIPO.LIGA(competicaoId),
  };
}

async function torneioCopa(
  competicaoId: string,
  nome: string,
  saveNome: string,
  usuarioId: string,
  encerrada: boolean,
  tipo: "COPA" | "SUPERCOPA"
): Promise<TorneioResumo | null> {
  const participante = await prisma.copaParticipante.findUnique({
    where: { competicaoId_usuarioId: { competicaoId, usuarioId } },
  });
  if (!participante) return null;

  const confronto = await prisma.copaConfronto.findFirst({
    where: { OR: [{ participanteAId: participante.id }, { participanteBId: participante.id }] },
    orderBy: { etapa: { ordem: "desc" } },
    include: { etapa: true },
  });

  if (!confronto) {
    return {
      competicaoId,
      tipo,
      saveNome,
      competicaoNome: nome,
      faseAtual: "Aguardando sorteio",
      enviados: 0,
      total: 0,
      eliminado: false,
      dataInicio: null,
      dataFinal: null,
      encerrada,
      href: HREF_POR_TIPO[tipo](competicaoId),
    };
  }

  const eliminado = !!confronto.vencedorId && confronto.vencedorId !== participante.id;

  const jogos = await prisma.jogo.findMany({
    where: { OR: [{ etapaId: confronto.etapaId, confrontoId: null }, { confrontoId: confronto.id }] },
  });
  const enviados = await prisma.palpite.count({
    where: {
      usuarioId,
      jogo: { OR: [{ etapaId: confronto.etapaId, confrontoId: null }, { confrontoId: confronto.id }] },
    },
  });
  const { inicio, final } = minMaxData(jogos);

  return {
    competicaoId,
    tipo,
    saveNome,
    competicaoNome: nome,
    faseAtual: confronto.etapa.nome,
    enviados,
    total: jogos.length,
    eliminado,
    dataInicio: inicio,
    dataFinal: final,
    encerrada,
    href: HREF_POR_TIPO[tipo](competicaoId),
  };
}

export async function torneiosUsuario(usuarioId: string): Promise<TorneioResumo[]> {
  const participacoes = await prisma.temporadaParticipante.findMany({
    where: { usuarioId, status: "APROVADO" },
    include: {
      temporada: {
        include: {
          save: true,
          competicoes: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  const torneios: TorneioResumo[] = [];

  for (const p of participacoes) {
    for (const c of p.temporada.competicoes) {
      const encerrada = c.status === "ENCERRADA";
      if (c.tipo === "LIGA") {
        torneios.push(await torneioLiga(c.id, c.nome, p.temporada.save.nome, usuarioId, encerrada));
      } else {
        const resumo = await torneioCopa(c.id, c.nome, p.temporada.save.nome, usuarioId, encerrada, c.tipo);
        if (resumo) torneios.push(resumo);
      }
    }
  }

  return torneios.sort((a, b) => {
    if (a.encerrada !== b.encerrada) return a.encerrada ? 1 : -1;
    const dataA = a.dataInicio?.getTime() ?? Infinity;
    const dataB = b.dataInicio?.getTime() ?? Infinity;
    return dataA - dataB;
  });
}

export async function torneiosDaTemporada(temporadaId: string, usuarioId: string): Promise<TorneioResumo[]> {
  const temporada = await prisma.temporada.findUniqueOrThrow({
    where: { id: temporadaId },
    include: { save: true, competicoes: { orderBy: { createdAt: "asc" } } },
  });

  const torneios: TorneioResumo[] = [];
  for (const c of temporada.competicoes) {
    const encerrada = c.status === "ENCERRADA";
    if (c.tipo === "LIGA") {
      torneios.push(await torneioLiga(c.id, c.nome, temporada.save.nome, usuarioId, encerrada));
    } else {
      const resumo = await torneioCopa(c.id, c.nome, temporada.save.nome, usuarioId, encerrada, c.tipo);
      if (resumo) torneios.push(resumo);
    }
  }
  return torneios;
}

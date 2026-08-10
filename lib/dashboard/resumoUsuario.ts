import { prisma } from "@/lib/prisma";
import { pontosConfronto } from "@/lib/scoring/pontosConfronto";

export interface PlacarEliminacao {
  fase: string;
  meusPontos: number;
  adversarioPontos: number;
  adversarioNome: string;
}

export interface PlacarAtual {
  meusPontos: number;
  adversarioPontos: number;
}

export interface ResumoCopa {
  tipo: "COPA" | "SUPERCOPA";
  competicaoId: string;
  nome: string;
  participa: boolean;
  status: "aguardando_chaveamento" | "ativo" | "eliminado" | "campeao" | "nao_participa";
  fase: string | null;
  proximoAdversario: string | null;
  confrontoAtualId: string | null;
  placarEliminacao: PlacarEliminacao | null;
  placarAtual: PlacarAtual | null;
  encerrada: boolean;
}

export async function resumoCopa(
  competicaoId: string,
  nome: string,
  usuarioId: string,
  encerrada: boolean,
  tipo: "COPA" | "SUPERCOPA" = "COPA"
): Promise<ResumoCopa> {
  const participante = await prisma.copaParticipante.findUnique({
    where: { competicaoId_usuarioId: { competicaoId, usuarioId } },
  });

  const base = {
    tipo,
    competicaoId,
    nome,
    proximoAdversario: null,
    confrontoAtualId: null,
    placarEliminacao: null,
    placarAtual: null,
    encerrada,
  };

  if (!participante) {
    return { ...base, participa: false, status: "nao_participa", fase: null };
  }

  const competicao = await prisma.competicao.findUniqueOrThrow({ where: { id: competicaoId } });

  const confronto = await prisma.copaConfronto.findFirst({
    where: { OR: [{ participanteAId: participante.id }, { participanteBId: participante.id }] },
    orderBy: { etapa: { ordem: "desc" } },
    include: {
      etapa: true,
      participanteA: { include: { usuario: true } },
      participanteB: { include: { usuario: true } },
    },
  });

  if (competicao.campeaoUsuarioId === usuarioId) {
    let placarAtual: PlacarAtual | null = null;
    if (confronto) {
      const adversarioFinal =
        confronto.participanteAId === participante.id ? confronto.participanteB : confronto.participanteA;
      if (adversarioFinal) {
        const [meusPontos, adversarioPontos] = await Promise.all([
          pontosConfronto(confronto.id, usuarioId),
          pontosConfronto(confronto.id, adversarioFinal.usuarioId),
        ]);
        placarAtual = { meusPontos, adversarioPontos };
      }
    }
    return {
      ...base,
      participa: true,
      status: "campeao",
      fase: null,
      confrontoAtualId: confronto?.id ?? null,
      placarAtual,
    };
  }

  if (!confronto) {
    return { ...base, participa: true, status: "aguardando_chaveamento", fase: null };
  }

  const adversarioParticipante =
    confronto.participanteAId === participante.id ? confronto.participanteB : confronto.participanteA;

  if (confronto.vencedorId && confronto.vencedorId !== participante.id) {
    const [meusPontos, adversarioPontos] = await Promise.all([
      pontosConfronto(confronto.id, usuarioId),
      adversarioParticipante ? pontosConfronto(confronto.id, adversarioParticipante.usuarioId) : Promise.resolve(0),
    ]);
    return {
      ...base,
      participa: true,
      status: "eliminado",
      fase: confronto.etapa.nome,
      confrontoAtualId: confronto.id,
      placarEliminacao: {
        fase: confronto.etapa.nome,
        meusPontos,
        adversarioPontos,
        adversarioNome: adversarioParticipante?.usuario.nome ?? "?",
      },
    };
  }

  if (confronto.vencedorId === participante.id && !confronto.proximoConfrontoId) {
    return { ...base, participa: true, status: "campeao", fase: null };
  }

  let placarAtual: PlacarAtual | null = null;
  if (adversarioParticipante) {
    const jogoComResultado = await prisma.jogo.findFirst({
      where: {
        placarCasa: { not: null },
        OR: [{ etapaId: confronto.etapaId, confrontoId: null }, { confrontoId: confronto.id }],
      },
    });
    if (jogoComResultado) {
      const [meusPontos, adversarioPontos] = await Promise.all([
        pontosConfronto(confronto.id, usuarioId),
        pontosConfronto(confronto.id, adversarioParticipante.usuarioId),
      ]);
      placarAtual = { meusPontos, adversarioPontos };
    }
  }

  return {
    ...base,
    participa: true,
    status: "ativo",
    fase: confronto.etapa.nome,
    proximoAdversario: adversarioParticipante?.usuario.nome ?? null,
    confrontoAtualId: adversarioParticipante ? confronto.id : null,
    placarAtual,
  };
}

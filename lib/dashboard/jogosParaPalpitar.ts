import { prisma } from "@/lib/prisma";
import type { JogoResumoData } from "@/components/JogoResumo";

export interface JogoParaPalpitarResumo extends JogoResumoData {
  saveId: string;
  saveNome: string;
  temporadaId: string;
  temporadaNome: string;
  competicaoId: string;
  competicaoNome: string;
  competicaoTipo: "LIGA" | "COPA" | "SUPERCOPA";
  etapaId: string;
  etapaNome: string;
  href: string;
  meuPalpite: { placarCasa: number; placarVisitante: number } | null;
}

export async function jogosParaPalpitar(
  usuarioId: string,
  opts: { temporadaId?: string; apenasPendentes?: boolean } = {}
): Promise<JogoParaPalpitarResumo[]> {
  const { temporadaId, apenasPendentes = false } = opts;

  const temporadaIds = temporadaId
    ? [temporadaId]
    : (
        await prisma.temporadaParticipante.findMany({
          where: { usuarioId, status: "APROVADO" },
          select: { temporadaId: true },
        })
      ).map((p) => p.temporadaId);

  if (temporadaIds.length === 0) return [];

  const jogosLigaDb = await prisma.jogo.findMany({
    where: {
      confrontoId: null,
      ...(apenasPendentes ? { placarCasa: null } : {}),
      etapa: { competicao: { tipo: "LIGA", temporadaId: { in: temporadaIds } } },
    },
    include: {
      timeCasa: true,
      timeVisitante: true,
      etapa: {
        include: { competicao: { include: { temporada: { include: { save: true } } } } },
      },
    },
  });

  const resultado: JogoParaPalpitarResumo[] = jogosLigaDb.map((j) => ({
    id: j.id,
    timeCasa: j.timeCasa,
    timeVisitante: j.timeVisitante,
    dataHora: j.dataHora,
    placarCasa: j.placarCasa,
    placarVisitante: j.placarVisitante,
    saveId: j.etapa.competicao.temporada.save.id,
    saveNome: j.etapa.competicao.temporada.save.nome,
    temporadaId: j.etapa.competicao.temporadaId,
    temporadaNome: j.etapa.competicao.temporada.nome,
    competicaoId: j.etapa.competicaoId,
    competicaoNome: j.etapa.competicao.nome,
    competicaoTipo: "LIGA",
    etapaId: j.etapaId,
    etapaNome: j.etapa.nome,
    href: `/usuario/competicoes/${j.etapa.competicaoId}/palpites?etapa=${j.etapaId}`,
    meuPalpite: null,
  }));

  const confrontosDoUsuario = await prisma.copaConfronto.findMany({
    where: {
      etapa: { competicao: { temporadaId: { in: temporadaIds } } },
      OR: [{ participanteA: { usuarioId } }, { participanteB: { usuarioId } }],
    },
    include: {
      etapa: {
        include: { competicao: { include: { temporada: { include: { save: true } } } } },
      },
    },
  });

  for (const c of confrontosDoUsuario) {
    const jogosCopaDb = await prisma.jogo.findMany({
      where: {
        ...(apenasPendentes ? { placarCasa: null } : {}),
        OR: [{ etapaId: c.etapaId, confrontoId: null }, { confrontoId: c.id }],
      },
      include: { timeCasa: true, timeVisitante: true },
    });

    for (const j of jogosCopaDb) {
      resultado.push({
        id: j.id,
        timeCasa: j.timeCasa,
        timeVisitante: j.timeVisitante,
        dataHora: j.dataHora,
        placarCasa: j.placarCasa,
        placarVisitante: j.placarVisitante,
        saveId: c.etapa.competicao.temporada.save.id,
        saveNome: c.etapa.competicao.temporada.save.nome,
        temporadaId: c.etapa.competicao.temporadaId,
        temporadaNome: c.etapa.competicao.temporada.nome,
        competicaoId: c.etapa.competicaoId,
        competicaoNome: c.etapa.competicao.nome,
        competicaoTipo: c.etapa.competicao.tipo as "COPA" | "SUPERCOPA",
        etapaId: c.etapaId,
        etapaNome: c.etapa.nome,
        href: `/usuario/competicoes/${c.etapa.competicaoId}/confrontos/${c.id}/palpites`,
        meuPalpite: null,
      });
    }
  }

  const meusPalpites = await prisma.palpite.findMany({
    where: { usuarioId, jogoId: { in: resultado.map((j) => j.id) } },
  });
  const palpitePorJogo = new Map(meusPalpites.map((p) => [p.jogoId, p]));
  for (const jogo of resultado) {
    const p = palpitePorJogo.get(jogo.id);
    if (p) jogo.meuPalpite = { placarCasa: p.placarCasa, placarVisitante: p.placarVisitante };
  }

  return resultado.sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());
}

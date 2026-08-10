import { prisma } from "@/lib/prisma";

interface EtapaComConfrontos {
  id: string;
  confrontos: {
    id: string;
    participanteA?: { usuarioId: string } | null;
    participanteB?: { usuarioId: string } | null;
  }[];
}

export type PontosDoParticipante = (
  usuarioId: string | null | undefined,
  etapaId: string,
  confrontoId: string
) => number | null;

/**
 * Soma os pontos de cada participante nos jogos compartilhados da etapa +
 * jogos extra do confronto, pra exibir o placar do confronto no chaveamento.
 */
export async function pontosDosConfrontos(etapas: EtapaComConfrontos[]): Promise<PontosDoParticipante> {
  const usuarioIds = [
    ...new Set(
      etapas.flatMap((e) =>
        e.confrontos.flatMap((c) => [c.participanteA?.usuarioId, c.participanteB?.usuarioId].filter((id): id is string => !!id))
      )
    ),
  ];
  const etapaIds = etapas.map((e) => e.id);
  const confrontoIds = etapas.flatMap((e) => e.confrontos.map((c) => c.id));

  const palpites =
    usuarioIds.length > 0
      ? await prisma.palpite.findMany({
          where: {
            usuarioId: { in: usuarioIds },
            jogo: { OR: [{ etapaId: { in: etapaIds }, confrontoId: null }, { confrontoId: { in: confrontoIds } }] },
          },
          select: { usuarioId: true, pontos: true, jogo: { select: { etapaId: true, confrontoId: true } } },
        })
      : [];

  const pontosPorEtapa = new Map<string, number>();
  const pontosPorConfronto = new Map<string, number>();
  for (const p of palpites) {
    if (p.jogo.confrontoId) {
      const chave = `${p.usuarioId}|${p.jogo.confrontoId}`;
      pontosPorConfronto.set(chave, (pontosPorConfronto.get(chave) ?? 0) + p.pontos);
    } else {
      const chave = `${p.usuarioId}|${p.jogo.etapaId}`;
      pontosPorEtapa.set(chave, (pontosPorEtapa.get(chave) ?? 0) + p.pontos);
    }
  }

  return (usuarioId, etapaId, confrontoId) => {
    if (!usuarioId) return null;
    const compartilhado = pontosPorEtapa.get(`${usuarioId}|${etapaId}`) ?? 0;
    const extra = pontosPorConfronto.get(`${usuarioId}|${confrontoId}`) ?? 0;
    return compartilhado + extra;
  };
}

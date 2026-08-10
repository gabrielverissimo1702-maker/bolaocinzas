import { prisma } from "@/lib/prisma";

export async function pontosConfronto(confrontoId: string, usuarioId: string): Promise<number> {
  const confronto = await prisma.copaConfronto.findUniqueOrThrow({ where: { id: confrontoId } });

  const resultado = await prisma.palpite.aggregate({
    _sum: { pontos: true },
    where: {
      usuarioId,
      jogo: {
        OR: [{ etapaId: confronto.etapaId, confrontoId: null }, { confrontoId: confronto.id }],
      },
    },
  });

  return resultado._sum.pontos ?? 0;
}

export async function contarResultados(
  confrontoId: string,
  usuarioId: string,
  tipos: ("CRAVADA" | "ACERTO_PARCIAL")[]
): Promise<number> {
  const confronto = await prisma.copaConfronto.findUniqueOrThrow({ where: { id: confrontoId } });

  return prisma.palpite.count({
    where: {
      usuarioId,
      tipoResultado: { in: tipos },
      jogo: {
        OR: [{ etapaId: confronto.etapaId, confrontoId: null }, { confrontoId: confronto.id }],
      },
    },
  });
}

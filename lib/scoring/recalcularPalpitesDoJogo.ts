import { prisma } from "@/lib/prisma";
import { calcularResultadoPalpite } from "./calcularResultadoPalpite";

export async function recalcularPalpitesDoJogo(jogoId: string): Promise<void> {
  const jogo = await prisma.jogo.findUniqueOrThrow({
    where: { id: jogoId },
    include: { etapa: { include: { competicao: true } }, palpites: true },
  });

  if (jogo.placarCasa == null || jogo.placarVisitante == null) return;

  const pontuacao = {
    pontosCravada: jogo.etapa.competicao.pontosCravada,
    pontosAcerto: jogo.etapa.competicao.pontosAcerto,
  };
  const resultadoFinal = { casa: jogo.placarCasa, visitante: jogo.placarVisitante };

  await prisma.$transaction(
    jogo.palpites.map((palpite) => {
      const { tipo, pontos } = calcularResultadoPalpite(
        { casa: palpite.placarCasa, visitante: palpite.placarVisitante },
        resultadoFinal,
        pontuacao
      );
      return prisma.palpite.update({
        where: { id: palpite.id },
        data: { tipoResultado: tipo, pontos },
      });
    })
  );
}

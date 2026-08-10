import { prisma } from "@/lib/prisma";
import { contarResultados } from "./pontosConfronto";
import type { CriterioDesempate } from "@/app/generated/prisma/enums";

export interface ConfrontoParaDesempate {
  id: string;
  etapaId: string;
  participanteAId: string;
  participanteBId: string;
  usuarioIdA: string;
  usuarioIdB: string;
}

async function resolverPorJogoExtra(confronto: ConfrontoParaDesempate): Promise<string | "INDEFINIDO"> {
  const jogoExtra = await prisma.jogo.findFirst({ where: { confrontoId: confronto.id } });
  if (!jogoExtra || jogoExtra.placarCasa == null) return "INDEFINIDO";

  const [pontosA, pontosB] = await Promise.all([
    prisma.palpite.aggregate({
      _sum: { pontos: true },
      where: { usuarioId: confronto.usuarioIdA, jogoId: jogoExtra.id },
    }),
    prisma.palpite.aggregate({
      _sum: { pontos: true },
      where: { usuarioId: confronto.usuarioIdB, jogoId: jogoExtra.id },
    }),
  ]);

  const a = pontosA._sum.pontos ?? 0;
  const b = pontosB._sum.pontos ?? 0;
  if (a === b) return "SORTEIO_DIRETO" as never; // resolve abaixo via fallback
  return a > b ? confronto.participanteAId : confronto.participanteBId;
}

async function resolverPorContagem(
  confronto: ConfrontoParaDesempate,
  tipos: ("CRAVADA" | "ACERTO_PARCIAL")[]
): Promise<string | "INDEFINIDO"> {
  const [a, b] = await Promise.all([
    contarResultados(confronto.id, confronto.usuarioIdA, tipos),
    contarResultados(confronto.id, confronto.usuarioIdB, tipos),
  ]);
  if (a === b) return sortearVencedor(confronto);
  return a > b ? confronto.participanteAId : confronto.participanteBId;
}

function sortearVencedor(confronto: ConfrontoParaDesempate): string {
  return Math.random() < 0.5 ? confronto.participanteAId : confronto.participanteBId;
}

export async function aplicarCriterioDesempate(
  confronto: ConfrontoParaDesempate,
  criterio: CriterioDesempate
): Promise<string | "INDEFINIDO"> {
  switch (criterio) {
    case "JOGO_EXTRA": {
      const resultado = await resolverPorJogoExtra(confronto);
      if (resultado === "INDEFINIDO") return "INDEFINIDO";
      if ((resultado as string) === "SORTEIO_DIRETO") return sortearVencedor(confronto);
      return resultado;
    }
    case "MAIS_CRAVADAS":
      return resolverPorContagem(confronto, ["CRAVADA"]);
    case "MAIS_ACERTOS":
      return resolverPorContagem(confronto, ["CRAVADA", "ACERTO_PARCIAL"]);
    case "SORTEIO_DIRETO":
      return sortearVencedor(confronto);
  }
}

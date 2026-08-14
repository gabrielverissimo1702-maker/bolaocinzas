import { prisma } from "@/lib/prisma";

export type StatusRodada = "finalizada" | "em_andamento" | "disponivel" | "aguardando_jogos";

export interface RodadaResumo {
  id: string;
  nome: string;
  status: StatusRodada;
  feitos: number;
  total: number;
}

function calcularStatus(
  jogos: { dataHora: Date; placarCasa: number | null }[],
  agora: number
): { status: StatusRodada; feitos: number; total: number } {
  const total = jogos.length;
  if (total === 0) return { status: "aguardando_jogos", feitos: 0, total: 0 };

  const feitos = jogos.filter((j) => j.placarCasa != null || new Date(j.dataHora).getTime() <= agora).length;
  const todosEncerrados = jogos.every((j) => j.placarCasa != null);

  if (todosEncerrados) return { status: "finalizada", feitos, total };
  if (feitos > 0) return { status: "em_andamento", feitos, total };
  return { status: "disponivel", feitos, total };
}

async function calcularTodasRodadas(competicaoId: string): Promise<RodadaResumo[]> {
  const etapas = await prisma.etapa.findMany({
    where: { competicaoId },
    orderBy: { ordem: "asc" },
    include: { jogos: { where: { confrontoId: null }, select: { dataHora: true, placarCasa: true } } },
  });

  const agora = Date.now();
  return etapas.map((e) => ({ id: e.id, nome: e.nome, ...calcularStatus(e.jogos, agora) }));
}

/**
 * Retorna uma janela de etapas (rodadas/fases) em torno do ponto atual da
 * competição: a última finalizada, a atual e a próxima — priorizando o que é
 * relevante para palpitar agora, não simplesmente as N primeiras ou últimas.
 */
export async function resumoRodadas(competicaoId: string, limite = 3): Promise<RodadaResumo[]> {
  const calculadas = await calcularTodasRodadas(competicaoId);

  const primeiraNaoFinalizada = calculadas.findIndex((e) => e.status !== "finalizada");
  const inicio =
    primeiraNaoFinalizada === -1
      ? Math.max(0, calculadas.length - limite)
      : Math.max(0, primeiraNaoFinalizada - 1);

  return calculadas.slice(inicio, inicio + limite);
}

/** Todas as etapas da competição, sem janelar — usado no hub do admin. */
export async function resumoRodadasCompleto(competicaoId: string): Promise<RodadaResumo[]> {
  return calcularTodasRodadas(competicaoId);
}

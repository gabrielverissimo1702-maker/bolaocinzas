import { prisma } from "@/lib/prisma";

export interface PalpiteRevelado {
  usuarioId: string;
  nome: string;
  sigla: string;
  cores: string[];
  padraoUniforme: "SOLIDO" | "LISTRAS_VERTICAIS" | "LISTRAS_HORIZONTAIS" | "LISTRAS_DIAGONAIS";
  placarCasa: number;
  placarVisitante: number;
  tipoResultado: string | null;
  pontos: number | null;
}

/**
 * Palpites de todos (ou de um subconjunto) dos usuários pra um jogo — só deve ser
 * chamado depois que o jogo já travou (ver `jogoEstaTravado`), já que é isso que
 * autoriza a divulgação pros demais participantes.
 */
export async function buscarPalpitesRevelados(jogoId: string, usuarioIds?: string[]): Promise<PalpiteRevelado[]> {
  const palpites = await prisma.palpite.findMany({
    where: { jogoId, ...(usuarioIds ? { usuarioId: { in: usuarioIds } } : {}) },
    include: { usuario: true },
  });

  return palpites.map((p) => ({
    usuarioId: p.usuarioId,
    nome: p.usuario.nome,
    sigla: p.usuario.sigla,
    cores: p.usuario.cores,
    padraoUniforme: p.usuario.padraoUniforme,
    placarCasa: p.placarCasa,
    placarVisitante: p.placarVisitante,
    tipoResultado: p.tipoResultado === "PENDENTE" ? null : p.tipoResultado,
    pontos: p.tipoResultado === "PENDENTE" ? null : p.pontos,
  }));
}

/**
 * Um jogo trava (não aceita mais palpite novo/editado, e os palpites já dados
 * passam a ser divulgados pra todo mundo) assim que o horário do jogo chega,
 * mesmo que o admin ainda não tenha lançado o resultado real.
 */
export function jogoEstaTravado(dataHora: Date | string, placarCasa: number | null): boolean {
  return placarCasa != null || new Date(dataHora) <= new Date();
}


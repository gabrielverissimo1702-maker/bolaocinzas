import { prisma } from "@/lib/prisma";

export interface LinhaClassificacao {
  usuarioId: string;
  nome: string;
  sigla: string;
  cores: string[];
  padraoUniforme: "SOLIDO" | "LISTRAS_VERTICAIS" | "LISTRAS_HORIZONTAIS" | "LISTRAS_DIAGONAIS" | "MANGAS_CONTRASTANTES" | "GOLA_CONTRASTANTE" | "BICOLOR" | "DEGRADE";
  pontos: number;
  cravadas: number;
}

export async function calcularClassificacaoLiga(competicaoId: string): Promise<LinhaClassificacao[]> {
  const competicao = await prisma.competicao.findUniqueOrThrow({
    where: { id: competicaoId },
    select: { temporadaId: true },
  });

  const [participantes, somas, cravadasPorUsuario] = await Promise.all([
    prisma.temporadaParticipante.findMany({
      where: { temporadaId: competicao.temporadaId, status: "APROVADO" },
      include: { usuario: true },
    }),
    prisma.palpite.groupBy({
      by: ["usuarioId"],
      where: { jogo: { etapa: { competicaoId } } },
      _sum: { pontos: true },
    }),
    prisma.palpite.groupBy({
      by: ["usuarioId"],
      where: { jogo: { etapa: { competicaoId } }, tipoResultado: "CRAVADA" },
      _count: { _all: true },
    }),
  ]);

  const pontosPorUsuario = new Map(somas.map((s) => [s.usuarioId, s._sum.pontos ?? 0]));
  const cravadasMap = new Map(cravadasPorUsuario.map((c) => [c.usuarioId, c._count._all]));

  const linhas: LinhaClassificacao[] = participantes.map((p) => ({
    usuarioId: p.usuarioId,
    nome: p.usuario.nome,
    sigla: p.usuario.sigla,
    cores: p.usuario.cores,
    padraoUniforme: p.usuario.padraoUniforme,
    pontos: pontosPorUsuario.get(p.usuarioId) ?? 0,
    cravadas: cravadasMap.get(p.usuarioId) ?? 0,
  }));

  linhas.sort((a, b) => b.pontos - a.pontos);
  return linhas;
}

export interface RodadasInfo {
  completas: number;
  total: number;
}

/**
 * Uma rodada só entra na contagem quando todos os seus jogos já têm
 * resultado lançado (o último jogo da rodada foi atualizado).
 */
export async function calcularRodadasCompletas(competicaoId: string): Promise<RodadasInfo> {
  const etapas = await prisma.etapa.findMany({
    where: { competicaoId },
    include: { jogos: { select: { placarCasa: true } } },
  });

  const total = etapas.length;
  const completas = etapas.filter((e) => e.jogos.length > 0 && e.jogos.every((j) => j.placarCasa != null)).length;

  return { completas, total };
}


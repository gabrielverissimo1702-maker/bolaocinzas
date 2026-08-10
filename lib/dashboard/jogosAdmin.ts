import { prisma } from "@/lib/prisma";
import type { JogoResumoData } from "@/components/JogoResumo";

export interface JogoAdminResumo extends JogoResumoData {
  saveId: string;
  saveNome: string;
  temporadaId: string;
  temporadaNome: string;
  competicaoId: string;
  competicaoNome: string;
  competicaoTipo: "LIGA" | "COPA" | "SUPERCOPA";
  etapaId: string;
  etapaNome: string;
}

export async function jogosDoAdmin(usuarioId: string): Promise<JogoAdminResumo[]> {
  const jogos = await prisma.jogo.findMany({
    where: { etapa: { competicao: { temporada: { save: { criadorId: usuarioId } } } } },
    include: {
      timeCasa: true,
      timeVisitante: true,
      etapa: {
        include: { competicao: { include: { temporada: { include: { save: true } } } } },
      },
    },
    orderBy: { dataHora: "asc" },
  });

  return jogos.map((j) => ({
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
    competicaoTipo: j.etapa.competicao.tipo,
    etapaId: j.etapaId,
    etapaNome: j.etapa.nome,
  }));
}

import { prisma } from "@/lib/prisma";
import { jogosParaPalpitar } from "@/lib/dashboard/jogosParaPalpitar";
import { jogoEstaTravado } from "@/lib/dashboard/palpitesRevelados";

export type TipoCompeticao = "LIGA" | "COPA" | "SUPERCOPA";

export interface PalpitesHubCard {
  chave: string;
  saveId: string;
  saveNome: string;
  temporadaId: string;
  temporadaNome: string;
  competicaoId: string;
  competicaoNome: string;
  competicaoTipo: TipoCompeticao;
  etapaId: string;
  etapaNome: string;
  quantidadeJogos: number;
  prazo: Date | null;
  status: string;
  href: string;
}

export interface PalpitesFiltroOpcao {
  saveId: string;
  saveNome: string;
  temporadaId: string;
  temporadaNome: string;
  competicaoId: string;
  competicaoNome: string;
  competicaoTipo: TipoCompeticao;
  etapaId: string;
  etapaNome: string;
  etapaOrdem: number;
}

function menorData(datas: Date[]): Date | null {
  if (datas.length === 0) return null;
  return new Date(Math.min(...datas.map((d) => d.getTime())));
}

function maiorData(datas: Date[]): Date | null {
  if (datas.length === 0) return null;
  return new Date(Math.max(...datas.map((d) => d.getTime())));
}

export async function cardsParaPalpitar(usuarioId: string): Promise<PalpitesHubCard[]> {
  const jogos = (await jogosParaPalpitar(usuarioId, { apenasPendentes: true })).filter(
    (j) => !jogoEstaTravado(j.dataHora, j.placarCasa ?? null)
  );

  const grupos = new Map<string, typeof jogos>();
  for (const jogo of jogos) {
    const chave = `${jogo.competicaoId}|${jogo.etapaId}`;
    grupos.set(chave, [...(grupos.get(chave) ?? []), jogo]);
  }

  return [...grupos.entries()]
    .map(([chave, itens]) => {
      const primeiro = itens[0];
      const enviados = itens.filter((j) => j.meuPalpite).length;
      const href =
        primeiro.competicaoTipo === "LIGA"
          ? `/usuario/competicoes/${primeiro.competicaoId}/palpites?etapa=${primeiro.etapaId}`
          : primeiro.href;
      return {
        chave,
        saveId: primeiro.saveId,
        saveNome: primeiro.saveNome,
        temporadaId: primeiro.temporadaId,
        temporadaNome: primeiro.temporadaNome,
        competicaoId: primeiro.competicaoId,
        competicaoNome: primeiro.competicaoNome,
        competicaoTipo: primeiro.competicaoTipo,
        etapaId: primeiro.etapaId,
        etapaNome: primeiro.etapaNome,
        quantidadeJogos: itens.length,
        prazo: menorData(itens.map((j) => new Date(j.dataHora))),
        status: enviados === 0 ? "Aberto" : enviados === itens.length ? "Completo" : `${enviados}/${itens.length} enviados`,
        href,
      };
    })
    .sort((a, b) => (a.prazo?.getTime() ?? 0) - (b.prazo?.getTime() ?? 0))
    .slice(0, 3);
}

export async function opcoesConsultaPalpites(usuarioId: string): Promise<PalpitesFiltroOpcao[]> {
  const participacoes = await prisma.temporadaParticipante.findMany({
    where: { usuarioId, status: "APROVADO" },
    include: {
      temporada: {
        include: {
          save: true,
          competicoes: {
            orderBy: { createdAt: "asc" },
            include: {
              etapas: {
                orderBy: { ordem: "asc" },
                include: { jogos: { select: { id: true, dataHora: true, placarCasa: true } } },
              },
            },
          },
        },
      },
    },
  });

  return participacoes.flatMap((p) =>
    p.temporada.competicoes.flatMap((competicao) =>
      competicao.etapas
        .filter((etapa) => etapa.jogos.length > 0)
        .map((etapa) => ({
          saveId: p.temporada.save.id,
          saveNome: p.temporada.save.nome,
          temporadaId: p.temporadaId,
          temporadaNome: p.temporada.nome,
          competicaoId: competicao.id,
          competicaoNome: competicao.nome,
          competicaoTipo: competicao.tipo as TipoCompeticao,
          etapaId: etapa.id,
          etapaNome: etapa.nome,
          etapaOrdem: etapa.ordem,
        }))
    )
  );
}

export async function cardsParaVerPalpites(usuarioId: string): Promise<PalpitesHubCard[]> {
  const participacoes = await prisma.temporadaParticipante.findMany({
    where: { usuarioId, status: "APROVADO" },
    include: {
      temporada: {
        include: {
          save: true,
          competicoes: {
            orderBy: { createdAt: "asc" },
            include: {
              etapas: {
                orderBy: { ordem: "asc" },
                include: { jogos: { select: { id: true, dataHora: true, placarCasa: true } } },
              },
            },
          },
        },
      },
    },
  });

  const cards: PalpitesHubCard[] = [];
  for (const p of participacoes) {
    for (const competicao of p.temporada.competicoes) {
      for (const etapa of competicao.etapas) {
        const jogosVisiveis = etapa.jogos.filter((j) => jogoEstaTravado(j.dataHora, j.placarCasa));
        if (jogosVisiveis.length === 0) continue;
        cards.push({
          chave: `${competicao.id}|${etapa.id}`,
          saveId: p.temporada.save.id,
          saveNome: p.temporada.save.nome,
          temporadaId: p.temporadaId,
          temporadaNome: p.temporada.nome,
          competicaoId: competicao.id,
          competicaoNome: competicao.nome,
          competicaoTipo: competicao.tipo as TipoCompeticao,
          etapaId: etapa.id,
          etapaNome: etapa.nome,
          quantidadeJogos: jogosVisiveis.length,
          prazo: maiorData(jogosVisiveis.map((j) => j.dataHora)),
          status: "Disponível",
          href: `/usuario/palpites/ver?saveId=${p.temporada.save.id}&temporadaId=${p.temporadaId}&competicaoId=${competicao.id}&etapaId=${etapa.id}`,
        });
      }
    }
  }

  return cards.sort((a, b) => (b.prazo?.getTime() ?? 0) - (a.prazo?.getTime() ?? 0)).slice(0, 3);
}

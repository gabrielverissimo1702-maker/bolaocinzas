import { prisma } from "@/lib/prisma";
import { calcularClassificacaoLiga } from "@/lib/scoring/classificacaoLiga";

export interface ResultadoHistorico {
  competicaoId: string;
  tipo: "LIGA" | "COPA" | "SUPERCOPA";
  competicaoNome: string;
  temporadaNome: string;
  saveNome: string;
  campeao: boolean;
  vice: boolean;
  posicao: number | null;
  totalParticipantes: number | null;
  pontos: number | null;
  faseEliminado: string | null;
  href: string;
}

const HREF_POR_TIPO: Record<ResultadoHistorico["tipo"], (id: string) => string> = {
  LIGA: (id) => `/usuario/competicoes/${id}/classificacao`,
  COPA: (id) => `/usuario/competicoes/${id}/chaveamento`,
  SUPERCOPA: (id) => `/usuario/competicoes/${id}/supercopa`,
};

async function resultadoLiga(
  competicaoId: string,
  nome: string,
  temporadaNome: string,
  saveNome: string,
  usuarioId: string,
  campeaoUsuarioId: string | null
): Promise<ResultadoHistorico> {
  const classificacao = await calcularClassificacaoLiga(competicaoId);
  const indice = classificacao.findIndex((l) => l.usuarioId === usuarioId);
  const minhaLinha = indice >= 0 ? classificacao[indice] : null;

  return {
    competicaoId,
    tipo: "LIGA",
    competicaoNome: nome,
    temporadaNome,
    saveNome,
    campeao: campeaoUsuarioId === usuarioId,
    vice: false,
    posicao: indice >= 0 ? indice + 1 : null,
    totalParticipantes: classificacao.length,
    pontos: minhaLinha?.pontos ?? null,
    faseEliminado: null,
    href: HREF_POR_TIPO.LIGA(competicaoId),
  };
}

async function resultadoCopa(
  competicaoId: string,
  nome: string,
  temporadaNome: string,
  saveNome: string,
  usuarioId: string,
  campeaoUsuarioId: string | null,
  tipo: "COPA" | "SUPERCOPA"
): Promise<ResultadoHistorico | null> {
  const participante = await prisma.copaParticipante.findUnique({
    where: { competicaoId_usuarioId: { competicaoId, usuarioId } },
  });
  if (!participante) return null;

  const campeao = campeaoUsuarioId === usuarioId;
  let vice = false;
  let faseEliminado: string | null = null;

  if (!campeao) {
    const confronto = await prisma.copaConfronto.findFirst({
      where: { OR: [{ participanteAId: participante.id }, { participanteBId: participante.id }] },
      orderBy: { etapa: { ordem: "desc" } },
      include: { etapa: true },
    });

    if (confronto) {
      // Confronto sem próxima etapa é a final — quem perdeu ali é o vice.
      const foiFinal = confronto.proximoConfrontoId === null;
      vice = foiFinal && confronto.vencedorId != null && confronto.vencedorId !== participante.id;
      if (!vice) faseEliminado = confronto.etapa.nome;
    }
  }

  return {
    competicaoId,
    tipo,
    competicaoNome: nome,
    temporadaNome,
    saveNome,
    campeao,
    vice,
    posicao: null,
    totalParticipantes: null,
    pontos: null,
    faseEliminado,
    href: HREF_POR_TIPO[tipo](competicaoId),
  };
}

export async function historicoUsuario(usuarioId: string): Promise<ResultadoHistorico[]> {
  const participacoes = await prisma.temporadaParticipante.findMany({
    where: { usuarioId, status: "APROVADO" },
    orderBy: { temporada: { createdAt: "desc" } },
    include: {
      temporada: {
        include: {
          save: true,
          competicoes: { where: { status: "ENCERRADA" }, orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  const resultados: ResultadoHistorico[] = [];

  for (const p of participacoes) {
    for (const c of p.temporada.competicoes) {
      if (c.tipo === "LIGA") {
        resultados.push(
          await resultadoLiga(c.id, c.nome, p.temporada.nome, p.temporada.save.nome, usuarioId, c.campeaoUsuarioId)
        );
      } else {
        const resultado = await resultadoCopa(
          c.id,
          c.nome,
          p.temporada.nome,
          p.temporada.save.nome,
          usuarioId,
          c.campeaoUsuarioId,
          c.tipo
        );
        if (resultado) resultados.push(resultado);
      }
    }
  }

  return resultados;
}

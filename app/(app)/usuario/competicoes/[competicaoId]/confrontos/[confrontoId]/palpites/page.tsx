import { notFound } from "next/navigation";
import { requireUsuario } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { buscarPalpitesRevelados, jogoEstaTravado } from "@/lib/dashboard/palpitesRevelados";
import { PalpitesRodadaCard, type JogoParaPalpitar } from "@/components/PalpitesRodadaCard";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function ConfrontoPalpitesPage({
  params,
}: {
  params: Promise<{ competicaoId: string; confrontoId: string }>;
}) {
  const usuario = await requireUsuario();
  const { competicaoId, confrontoId } = await params;

  const confronto = await prisma.copaConfronto.findUnique({
    where: { id: confrontoId },
    include: {
      etapa: { include: { competicao: true } },
      participanteA: { include: { usuario: true } },
      participanteB: { include: { usuario: true } },
    },
  });

  if (!confronto || confronto.etapa.competicaoId !== competicaoId) notFound();

  const souA = confronto.participanteA?.usuarioId === usuario.id;
  const souB = confronto.participanteB?.usuarioId === usuario.id;
  const souParticipante = souA || souB;

  const adversario = souA ? confronto.participanteB?.usuario.nome : confronto.participanteA?.usuario.nome;
  const titulo = souParticipante
    ? `Confronto vs ${adversario ?? "?"}`
    : `${confronto.participanteA?.usuario.nome ?? "?"} vs ${confronto.participanteB?.usuario.nome ?? "?"}`;

  const usuarioIdsConfronto = [confronto.participanteA?.usuarioId, confronto.participanteB?.usuarioId].filter(
    (id): id is string => !!id
  );

  const jogosDb = await prisma.jogo.findMany({
    where: { OR: [{ etapaId: confronto.etapaId, confrontoId: null }, { confrontoId: confronto.id }] },
    orderBy: { dataHora: "asc" },
    include: {
      timeCasa: true,
      timeVisitante: true,
      palpites: { where: { usuarioId: usuario.id } },
    },
  });

  const jogos: JogoParaPalpitar[] = await Promise.all(
    jogosDb.map(async (jogo) => {
      const travado = jogoEstaTravado(jogo.dataHora, jogo.placarCasa);
      return {
        id: jogo.id,
        dataHora: jogo.dataHora,
        placarCasa: jogo.placarCasa,
        placarVisitante: jogo.placarVisitante,
        timeCasa: jogo.timeCasa,
        timeVisitante: jogo.timeVisitante,
        ehJogoExtra: jogo.confrontoId != null,
        palpite:
          souParticipante && jogo.palpites[0]
            ? {
                placarCasa: jogo.palpites[0].placarCasa,
                placarVisitante: jogo.palpites[0].placarVisitante,
                tipoResultado: jogo.palpites[0].tipoResultado,
                pontos: jogo.palpites[0].pontos,
              }
            : null,
        palpitesRevelados: travado ? await buscarPalpitesRevelados(jogo.id, usuarioIdsConfronto) : null,
      };
    })
  );

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={titulo}
        backHref={`/usuario/competicoes/${competicaoId}/chaveamento`}
        backLabel={confronto.etapa.competicao.nome}
      />

      {jogos.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">Nenhum jogo cadastrado ainda.</p>
      ) : (
        <PalpitesRodadaCard
          etapaNome={confronto.etapa.nome}
          jogos={jogos}
          meuUsuarioId={usuario.id}
          layoutRevelacao="comparativo"
          somenteLeitura={!souParticipante}
        />
      )}
    </div>
  );
}

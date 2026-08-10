import { notFound } from "next/navigation";
import { requireUsuario } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { buscarPalpitesRevelados, jogoEstaTravado } from "@/lib/dashboard/palpitesRevelados";
import { PalpitesComRodadas, type RodadaComJogos } from "@/components/PalpitesComRodadas";
import type { JogoParaPalpitar } from "@/components/PalpitesRodadaCard";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function PalpitesPage({
  params,
  searchParams,
}: {
  params: Promise<{ competicaoId: string }>;
  searchParams: Promise<{ etapa?: string }>;
}) {
  const usuario = await requireUsuario();
  const { competicaoId } = await params;
  const { etapa: etapaInicialId } = await searchParams;

  const competicao = await prisma.competicao.findUnique({
    where: { id: competicaoId },
    include: {
      etapas: {
        orderBy: { ordem: "asc" },
        include: {
          jogos: {
            where: { confrontoId: null },
            orderBy: { dataHora: "asc" },
            include: {
              timeCasa: true,
              timeVisitante: true,
              palpites: { where: { usuarioId: usuario.id } },
            },
          },
        },
      },
    },
  });
  if (!competicao) notFound();

  const participante = await prisma.temporadaParticipante.findUnique({
    where: {
      temporadaId_usuarioId: { temporadaId: competicao.temporadaId, usuarioId: usuario.id },
    },
  });
  if (!participante || participante.status !== "APROVADO") notFound();

  const rodadas: RodadaComJogos[] = await Promise.all(
    competicao.etapas
      .filter((etapa) => etapa.jogos.length > 0)
      .map(async (etapa) => {
        const jogos: JogoParaPalpitar[] = await Promise.all(
          etapa.jogos.map(async (jogo) => {
            const travado = jogoEstaTravado(jogo.dataHora, jogo.placarCasa);
            return {
              id: jogo.id,
              dataHora: jogo.dataHora,
              placarCasa: jogo.placarCasa,
              placarVisitante: jogo.placarVisitante,
              timeCasa: jogo.timeCasa,
              timeVisitante: jogo.timeVisitante,
              palpite: jogo.palpites[0]
                ? {
                    placarCasa: jogo.palpites[0].placarCasa,
                    placarVisitante: jogo.palpites[0].placarVisitante,
                    tipoResultado: jogo.palpites[0].tipoResultado,
                    pontos: jogo.palpites[0].pontos,
                  }
                : null,
              palpitesRevelados: travado ? await buscarPalpitesRevelados(jogo.id) : null,
            };
          })
        );
        return { id: etapa.id, nome: etapa.nome, ordem: etapa.ordem, jogos };
      })
  );

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Palpites"
        backHref={`/usuario/temporadas/${competicao.temporadaId}`}
        backLabel={competicao.nome}
      />

      {rodadas.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum jogo cadastrado ainda.</p>
      ) : (
        <PalpitesComRodadas rodadas={rodadas} meuUsuarioId={usuario.id} etapaInicialId={etapaInicialId} />
      )}
    </div>
  );
}

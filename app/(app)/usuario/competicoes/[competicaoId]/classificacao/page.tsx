import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUsuario } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { calcularClassificacaoLiga, calcularRodadasCompletas } from "@/lib/scoring/classificacaoLiga";
import { jogosParaPalpitar } from "@/lib/dashboard/jogosParaPalpitar";
import { jogoEstaTravado } from "@/lib/dashboard/palpitesRevelados";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { JogoResumo } from "@/components/JogoResumo";
import { ClassificacaoTabela } from "@/components/ClassificacaoTabela";
import { IconArrowRight } from "@/components/ui/icons";

export default async function ClassificacaoPage({
  params,
}: {
  params: Promise<{ competicaoId: string }>;
}) {
  const usuario = await requireUsuario();
  const { competicaoId } = await params;

  const competicao = await prisma.competicao.findUnique({
    where: { id: competicaoId },
    include: {
      temporada: { include: { save: true } },
      etapas: {
        orderBy: { ordem: "asc" },
        include: { jogos: { select: { dataHora: true, placarCasa: true } } },
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

  const [classificacao, rodadasInfo, jogosPendentes] = await Promise.all([
    calcularClassificacaoLiga(competicaoId),
    calcularRodadasCompletas(competicaoId),
    jogosParaPalpitar(usuario.id, { temporadaId: competicao.temporadaId, apenasPendentes: true }),
  ]);
  const minhaPosicao = classificacao.findIndex((l) => l.usuarioId === usuario.id);
  const minhaLinha = minhaPosicao >= 0 ? classificacao[minhaPosicao] : null;
  const top3 = classificacao.slice(0, 3);
  const jogosDaLiga = jogosPendentes.filter((j) => j.competicaoId === competicaoId);
  const etapaDivulgacao =
    [...competicao.etapas].reverse().find((e) => e.jogos.some((j) => jogoEstaTravado(j.dataHora, j.placarCasa))) ??
    competicao.etapas.find((e) => e.jogos.length > 0);
  const divulgacaoHref = etapaDivulgacao
    ? `/usuario/palpites/ver?saveId=${competicao.temporada.save.id}&temporadaId=${competicao.temporadaId}&competicaoId=${competicaoId}&etapaId=${etapaDivulgacao.id}`
    : `/usuario/palpites/ver?saveId=${competicao.temporada.save.id}&temporadaId=${competicao.temporadaId}&competicaoId=${competicaoId}`;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Liga" backHref={`/usuario/temporadas/${competicao.temporadaId}`} backLabel={competicao.nome} />

      {minhaLinha && (
        <Card className="mb-6 rounded-2xl border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 shadow-lg shadow-black/30 dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950">
          <p className="mb-3 text-xs font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">
            Meu desempenho
          </p>
          <div className="grid grid-cols-3 divide-x divide-slate-800">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] font-bold tracking-wider text-blue-600 uppercase dark:text-blue-400">
                Colocação
              </span>
              <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{minhaPosicao + 1}º</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                Pontos
              </span>
              <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{minhaLinha.pontos}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
                Cravadas
              </span>
              <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{minhaLinha.cravadas}</span>
            </div>
          </div>
        </Card>
      )}

      {top3.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-xs font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">
            Top 3
          </p>
          <ClassificacaoTabela linhas={top3} meuUsuarioId={usuario.id} rodadas={rodadasInfo} />
          <LinkButton href={`/usuario/competicoes/${competicaoId}/classificacao/completa`} variant="outline" className="mt-3 w-full">
            Ver classificação completa
          </LinkButton>
        </div>
      )}

      <p className="mb-2 text-xs font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">
        Jogos a palpitar
      </p>
      {jogosDaLiga.length === 0 ? (
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Nenhum jogo pendente de palpite no momento.</p>
      ) : (
        <div className="mb-6 flex flex-col gap-3">
          {jogosDaLiga.map((j) => (
            <JogoResumo key={j.id} jogo={j} href="/usuario/palpites" compacto />
          ))}
        </div>
      )}

      <Link href={divulgacaoHref}>
        <Card className="flex items-center justify-between rounded-2xl border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 shadow-lg shadow-black/30 transition hover:border-slate-600 dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 dark:hover:border-slate-600">
          <div>
            <p className="text-xs font-bold tracking-widest text-purple-400 uppercase">Divulgação</p>
            <p className="font-semibold text-slate-50">Ver palpites de todos os participantes</p>
          </div>
          <IconArrowRight className="h-5 w-5 text-purple-400" />
        </Card>
      </Link>
    </div>
  );
}




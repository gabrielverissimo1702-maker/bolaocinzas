import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUsuario } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { opcoesConsultaPalpites } from "@/lib/dashboard/palpitesHub";
import { buscarPalpitesRevelados, jogoEstaTravado } from "@/lib/dashboard/palpitesRevelados";
import { pontosDosConfrontos } from "@/lib/copa/pontosConfrontos";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Jersey } from "@/components/ui/Jersey";
import { UsuarioUniforme, type UsuarioUniformeInfo } from "@/components/UsuarioUniforme";
import { PalpitesRodadaCard, type JogoParaPalpitar } from "@/components/PalpitesRodadaCard";
import { FiltrosConsultaPalpites } from "./FiltrosConsultaPalpites";
import { IconChevronLeft, IconChevronRight } from "@/components/ui/icons";

const TIPO_LABEL = { LIGA: "Liga", COPA: "Copa", SUPERCOPA: "Supercopa" } as const;

type Search = { saveId?: string; temporadaId?: string; competicaoId?: string; etapaId?: string };

function palpiteTexto(palpite?: { placarCasa: number; placarVisitante: number } | null) {
  if (!palpite) return "- x -";
  return `${palpite.placarCasa} x ${palpite.placarVisitante}`;
}

function resultadoReal(jogo: { placarCasa: number | null; placarVisitante: number | null }) {
  if (jogo.placarCasa == null || jogo.placarVisitante == null) return "- x -";
  return `${jogo.placarCasa} x ${jogo.placarVisitante}`;
}

function classePalpite(palpite?: { tipoResultado: string | null } | null) {
  if (!palpite?.tipoResultado || palpite.tipoResultado === "PENDENTE") {
    return "border-slate-700 bg-slate-900/80 text-slate-200";
  }
  if (palpite.tipoResultado === "CRAVADA") {
    return "border-amber-400/80 bg-amber-400/15 text-amber-100 ring-1 ring-amber-400/20";
  }
  if (palpite.tipoResultado === "ACERTO_PARCIAL") {
    return "border-emerald-400/80 bg-emerald-400/15 text-emerald-100 ring-1 ring-emerald-400/20";
  }
  return "border-red-400/80 bg-red-400/15 text-red-100 ring-1 ring-red-400/20";
}

function etapaHref(search: Required<Search>, etapaId: string) {
  const params = new URLSearchParams({ ...search, etapaId });
  return `/usuario/palpites/ver?${params.toString()}`;
}

function resolveSelecao(opcoes: Awaited<ReturnType<typeof opcoesConsultaPalpites>>, search: Search) {
  if (opcoes.length === 0) return null;
  const saveId = search.saveId && opcoes.some((o) => o.saveId === search.saveId) ? search.saveId : opcoes[0].saveId;
  const porSave = opcoes.filter((o) => o.saveId === saveId);
  const temporadaId =
    search.temporadaId && porSave.some((o) => o.temporadaId === search.temporadaId)
      ? search.temporadaId
      : porSave[0].temporadaId;
  const porTemporada = porSave.filter((o) => o.temporadaId === temporadaId);
  const competicaoId =
    search.competicaoId && porTemporada.some((o) => o.competicaoId === search.competicaoId)
      ? search.competicaoId
      : porTemporada[0].competicaoId;
  const porCompeticao = porTemporada.filter((o) => o.competicaoId === competicaoId);
  const etapaId =
    search.etapaId && porCompeticao.some((o) => o.etapaId === search.etapaId)
      ? search.etapaId
      : porCompeticao[0].etapaId;
  return { saveId, temporadaId, competicaoId, etapaId };
}

function NavegacaoFases({
  etapas,
  atualId,
  search,
}: {
  etapas: { id: string; nome: string }[];
  atualId: string;
  search: Required<Search>;
}) {
  const indice = etapas.findIndex((e) => e.id === atualId);
  const anterior = indice > 0 ? etapas[indice - 1] : null;
  const proxima = indice >= 0 && indice < etapas.length - 1 ? etapas[indice + 1] : null;
  const atual = etapas[indice];

  return (
    <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/70 p-2">
      {anterior ? (
        <Link href={etapaHref(search, anterior.id)} className="flex h-9 min-w-0 flex-1 items-center gap-1 rounded-lg px-2 text-xs font-bold text-slate-300 hover:bg-slate-800">
          <IconChevronLeft className="h-4 w-4 shrink-0" />
          <span className="truncate">{anterior.nome}</span>
        </Link>
      ) : (
        <span className="flex h-9 flex-1 items-center gap-1 px-2 text-xs text-slate-600"><IconChevronLeft className="h-4 w-4" /></span>
      )}
      <span className="min-w-0 flex-[1.2] truncate rounded-lg bg-cyan-400/10 px-3 py-2 text-center text-xs font-extrabold uppercase tracking-wide text-cyan-300 ring-1 ring-cyan-400/20">
        {atual?.nome ?? "Fase"}
      </span>
      {proxima ? (
        <Link href={etapaHref(search, proxima.id)} className="flex h-9 min-w-0 flex-1 items-center justify-end gap-1 rounded-lg px-2 text-xs font-bold text-slate-300 hover:bg-slate-800">
          <span className="truncate">{proxima.nome}</span>
          <IconChevronRight className="h-4 w-4 shrink-0" />
        </Link>
      ) : (
        <span className="flex h-9 flex-1 items-center justify-end gap-1 px-2 text-xs text-slate-600"><IconChevronRight className="h-4 w-4" /></span>
      )}
    </div>
  );
}

async function LigaView({ competicaoId, etapaId, usuarioId }: { competicaoId: string; etapaId: string; usuarioId: string }) {
  const etapa = await prisma.etapa.findUnique({
    where: { id: etapaId },
    include: {
      jogos: {
        where: { confrontoId: null },
        orderBy: { dataHora: "asc" },
        include: { timeCasa: true, timeVisitante: true, palpites: { where: { usuarioId } } },
      },
    },
  });
  if (!etapa || etapa.competicaoId !== competicaoId) notFound();

  const jogos: JogoParaPalpitar[] = await Promise.all(
    etapa.jogos.map(async (jogo) => {
      const travado = jogoEstaTravado(jogo.dataHora, jogo.placarCasa);
      const meuPalpite = jogo.palpites[0];
      return {
        id: jogo.id,
        dataHora: jogo.dataHora,
        placarCasa: jogo.placarCasa,
        placarVisitante: jogo.placarVisitante,
        timeCasa: jogo.timeCasa,
        timeVisitante: jogo.timeVisitante,
        palpite: meuPalpite
          ? {
              placarCasa: meuPalpite.placarCasa,
              placarVisitante: meuPalpite.placarVisitante,
              tipoResultado: meuPalpite.tipoResultado,
              pontos: meuPalpite.pontos,
            }
          : null,
        palpitesRevelados: travado ? await buscarPalpitesRevelados(jogo.id) : null,
      };
    })
  );

  return <PalpitesRodadaCard etapaNome={etapa.nome} jogos={jogos} meuUsuarioId={usuarioId} somenteLeitura />;
}

async function CopaView({ competicaoId, etapaId, search }: { competicaoId: string; etapaId: string; search: Required<Search> }) {
  const competicao = await prisma.competicao.findUnique({
    where: { id: competicaoId },
    include: {
      etapas: {
        orderBy: { ordem: "asc" },
        include: {
          confrontos: {
            orderBy: { ordem: "asc" },
            include: { participanteA: { include: { usuario: true } }, participanteB: { include: { usuario: true } } },
          },
        },
      },
    },
  });
  if (!competicao) notFound();
  const etapa = competicao.etapas.find((e) => e.id === etapaId);
  if (!etapa) notFound();

  const jogos = await prisma.jogo.findMany({
    where: { OR: [{ etapaId, confrontoId: null }, { confronto: { etapaId } }] },
    orderBy: [{ confrontoId: "asc" }, { dataHora: "asc" }],
    include: { timeCasa: true, timeVisitante: true },
  });
  const jogosCompartilhados = jogos.filter((j) => j.confrontoId == null);
  const jogosPorConfronto = new Map<string, typeof jogos>();
  for (const jogo of jogos.filter((j) => j.confrontoId)) {
    jogosPorConfronto.set(jogo.confrontoId!, [...(jogosPorConfronto.get(jogo.confrontoId!) ?? []), jogo]);
  }

  const usuarioIds = etapa.confrontos.flatMap((c) => [c.participanteA?.usuarioId, c.participanteB?.usuarioId]).filter((id): id is string => Boolean(id));
  const palpites = await prisma.palpite.findMany({
    where: { usuarioId: { in: usuarioIds }, jogoId: { in: jogos.map((j) => j.id) } },
    select: { usuarioId: true, jogoId: true, placarCasa: true, placarVisitante: true, tipoResultado: true, pontos: true },
  });
  const palpiteMap = new Map(palpites.map((p) => [`${p.usuarioId}|${p.jogoId}`, p]));
  const pontosDoParticipante = await pontosDosConfrontos([etapa]);
  const etapasNav = competicao.etapas.map((e) => ({ id: e.id, nome: e.nome }));

  return (
    <div>
      <NavegacaoFases etapas={etapasNav} atualId={etapaId} search={search} />
      <div className="flex flex-col gap-4">
        {etapa.confrontos.map((confronto) => {
          const participanteA = confronto.participanteA?.usuario ?? null;
          const participanteB = confronto.participanteB?.usuario ?? null;
          const pontosA = pontosDoParticipante(confronto.participanteA?.usuarioId, etapa.id, confronto.id) ?? 0;
          const pontosB = pontosDoParticipante(confronto.participanteB?.usuarioId, etapa.id, confronto.id) ?? 0;
          const jogosDoConfronto = [...jogosCompartilhados, ...(jogosPorConfronto.get(confronto.id) ?? [])];

          return (
            <Card key={confronto.id} className="border-slate-800 bg-gradient-to-b from-[#1a2035] to-[#0d1220] p-3 text-white shadow-lg sm:p-4">
              <div className="mb-3 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-2.5 sm:mb-4 sm:p-3">
                <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                  <div className="min-w-0">
                    {participanteA ? <UsuarioUniforme usuario={participanteA} size={26} className="text-white" /> : <span className="text-sm text-slate-500">Aguardando</span>}
                  </div>
                  <div className="rounded-lg bg-slate-950/60 px-3 py-1 text-center text-lg font-extrabold tabular-nums sm:text-xl text-cyan-300">
                    {pontosA} x {pontosB}
                  </div>
                  <div className="min-w-0 justify-self-end">
                    {participanteB ? <UsuarioUniforme usuario={participanteB} size={26} lado="direita" className="justify-end text-white" /> : <span className="text-sm text-slate-500">Aguardando</span>}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 sm:gap-3">
                {jogosDoConfronto.map((jogo) => {
                  const palpiteA = participanteA ? palpiteMap.get(`${participanteA.id}|${jogo.id}`) : null;
                  const palpiteB = participanteB ? palpiteMap.get(`${participanteB.id}|${jogo.id}`) : null;
                  return (
                    <div key={jogo.id} className="rounded-lg border border-slate-700/70 bg-slate-950/35 p-2.5 sm:p-3">
                      <div className="mb-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 text-center">
                        <div className="flex min-w-0 items-center justify-end gap-1">
                          <span className="truncate text-[11px] font-extrabold uppercase text-slate-200 sm:text-xs">{jogo.timeCasa.sigla}</span>
                          <Jersey {...jogo.timeCasa} size={24} />
                        </div>
                        <div className="rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1">
                          <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Resultado</p>
                          <p className="text-sm font-extrabold tabular-nums text-cyan-300">{resultadoReal(jogo)}</p>
                        </div>
                        <div className="flex min-w-0 items-center gap-1">
                          <Jersey {...jogo.timeVisitante} size={24} />
                          <span className="truncate text-[11px] font-extrabold uppercase text-slate-200 sm:text-xs">{jogo.timeVisitante.sigla}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                        <div className={`rounded-md border px-2 py-1.5 text-center ${classePalpite(palpiteA)}`}>
                          <p className="truncate text-[10px] font-bold opacity-75 sm:text-[11px]">{participanteA?.nome ?? "Aguardando"}</p>
                          <p className="text-sm font-extrabold tabular-nums sm:text-base">{palpiteTexto(palpiteA)}</p>
                          <p className="text-[10px] font-bold opacity-75">{palpiteA?.pontos ?? 0} pts</p>
                        </div>
                        <div className={`rounded-md border px-2 py-1.5 text-center ${classePalpite(palpiteB)}`}>
                          <p className="truncate text-[10px] font-bold opacity-75 sm:text-[11px]">{participanteB?.nome ?? "Aguardando"}</p>
                          <p className="text-sm font-extrabold tabular-nums sm:text-base">{palpiteTexto(palpiteB)}</p>
                          <p className="text-[10px] font-bold opacity-75">{palpiteB?.pontos ?? 0} pts</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {jogosDoConfronto.length === 0 && <p className="text-sm text-slate-400">Nenhum jogo cadastrado nesta fase.</p>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default async function VerPalpitesPage({ searchParams }: { searchParams: Promise<Search> }) {
  const usuario = await requireUsuario();
  const search = await searchParams;
  const opcoes = await opcoesConsultaPalpites(usuario.id);
  const selecao = resolveSelecao(opcoes, search);

  if (!selecao) {
    return (
      <div className="mx-auto max-w-3xl">
        <PageHeader title="Ver palpites" backHref="/usuario/palpites" backLabel="Palpites" />
        <Card className="border-slate-800 bg-slate-900/70 text-sm text-slate-400">Nenhuma rodada ou fase disponível para consulta.</Card>
      </div>
    );
  }

  const competicao = await prisma.competicao.findUnique({ where: { id: selecao.competicaoId } });
  if (!competicao || competicao.temporadaId !== selecao.temporadaId) notFound();

  const participante = await prisma.temporadaParticipante.findUnique({
    where: { temporadaId_usuarioId: { temporadaId: competicao.temporadaId, usuarioId: usuario.id } },
  });
  if (!participante || participante.status !== "APROVADO") notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Ver palpites"
        subtitle={`${TIPO_LABEL[competicao.tipo]} · ${competicao.nome}`}
        backHref="/usuario/palpites"
        backLabel="Palpites"
        action={<Badge tone="info">{opcoes.find((o) => o.etapaId === selecao.etapaId)?.etapaNome ?? "Fase"}</Badge>}
      />

      <FiltrosConsultaPalpites opcoes={opcoes} valores={selecao} />

      {competicao.tipo === "LIGA" ? (
        <LigaView competicaoId={selecao.competicaoId} etapaId={selecao.etapaId} usuarioId={usuario.id} />
      ) : (
        <CopaView competicaoId={selecao.competicaoId} etapaId={selecao.etapaId} search={selecao} />
      )}
    </div>
  );
}


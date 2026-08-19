import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resumoCopa } from "@/lib/dashboard/resumoUsuario";
import { resumoRodadas } from "@/lib/dashboard/resumoRodadas";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { UsuarioUniforme, type UsuarioUniformeInfo } from "@/components/UsuarioUniforme";
import { RodadasResumoLista } from "@/components/RodadasResumoLista";
import { IconArrowRight } from "@/components/ui/icons";

const CORES = {
  COPA: {
    texto: "text-purple-600 dark:text-purple-400",
    card: "border-slate-200 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/40 hover:border-slate-400 dark:hover:border-slate-600",
    box: "bg-slate-100/60 dark:bg-slate-800/40",
  },
  SUPERCOPA: {
    texto: "text-amber-600 dark:text-amber-400",
    card: "border-slate-200 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/40 hover:border-slate-400 dark:hover:border-slate-600",
    box: "bg-slate-100/60 dark:bg-slate-800/40",
  },
} as const;

const TITULO = { COPA: "Copa", SUPERCOPA: "Supercopa" } as const;
const ROTA_BASE = { COPA: "chaveamento", SUPERCOPA: "supercopa" } as const;

function usuarioInfo(usuario: UsuarioUniformeInfo): UsuarioUniformeInfo {
  return {
    nome: usuario.nome,
    sigla: usuario.sigla,
    cores: usuario.cores,
    padraoUniforme: usuario.padraoUniforme,
    corSigla: usuario.corSigla,
  };
}

function StatusBadge({ encerrada }: { encerrada: boolean }) {
  return <Badge tone={encerrada ? "neutral" : "success"}>{encerrada ? "Encerrada" : "Em andamento"}</Badge>;
}

export async function HubChaveamento({
  competicaoId,
  usuarioId,
  tipo,
}: {
  competicaoId: string;
  usuarioId: string;
  tipo: "COPA" | "SUPERCOPA";
}) {
  const cor = CORES[tipo];

  const competicao = await prisma.competicao.findUnique({
    where: { id: competicaoId },
    include: { temporada: { include: { save: true } } },
  });
  if (!competicao || competicao.tipo !== tipo) notFound();

  const [resumo, usuarioAtual, rodadas] = await Promise.all([
    resumoCopa(competicaoId, competicao.nome, usuarioId, competicao.status === "ENCERRADA", tipo),
    prisma.usuario.findUnique({ where: { id: usuarioId } }),
    resumoRodadas(competicaoId),
  ]);
  if (!usuarioAtual) notFound();

  const confrontoAtual = resumo.confrontoAtualId
    ? await prisma.copaConfronto.findUnique({
        where: { id: resumo.confrontoAtualId },
        include: {
          etapa: true,
          participanteA: { include: { usuario: true } },
          participanteB: { include: { usuario: true } },
        },
      })
    : null;

  const adversarioParticipante =
    confrontoAtual?.participanteA?.usuarioId === usuarioId
      ? confrontoAtual.participanteB
      : confrontoAtual?.participanteB?.usuarioId === usuarioId
        ? confrontoAtual.participanteA
        : null;

  const adversario = adversarioParticipante?.usuario ? usuarioInfo(adversarioParticipante.usuario) : null;
  const souA = confrontoAtual?.participanteA?.usuarioId === usuarioId;
  const eu = usuarioInfo(usuarioAtual);
  const jogadorA = souA ? eu : adversario;
  const jogadorB = souA ? adversario : eu;

  const faseAtual =
    resumo.status === "aguardando_chaveamento"
      ? "Aguardando sorteio"
      : resumo.status === "campeao"
        ? "Campeão"
        : (resumo.fase ?? confrontoAtual?.etapa.nome ?? "-");

  const meusPontos = resumo.placarAtual?.meusPontos ?? resumo.placarEliminacao?.meusPontos;
  const adversarioPontos = resumo.placarAtual?.adversarioPontos ?? resumo.placarEliminacao?.adversarioPontos;
  const pontosA = souA ? meusPontos : adversarioPontos;
  const pontosB = souA ? adversarioPontos : meusPontos;

  const visualizacaoHref = confrontoAtual
    ? `/usuario/palpites/ver?saveId=${competicao.temporada.save.id}&temporadaId=${competicao.temporadaId}&competicaoId=${competicaoId}&etapaId=${confrontoAtual.etapaId}`
    : null;
  const chaveamentoHref = `/usuario/competicoes/${competicaoId}/${ROTA_BASE[tipo]}/completo`;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={TITULO[tipo]}
        subtitle={competicao.nome}
        backHref={`/usuario/temporadas/${competicao.temporadaId}`}
        backLabel={competicao.nome}
        action={<StatusBadge encerrada={competicao.status === "ENCERRADA"} />}
      />

      <div className="flex flex-col gap-4">
        <Card className={cor.card}>
          <p className="text-xs font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">
            Fase atual
          </p>
          <p className={`text-2xl font-extrabold uppercase ${cor.texto}`}>{faseAtual}</p>
        </Card>

        {resumo.status === "aguardando_chaveamento" ? (
          <Card className={cor.card}>
            <p className={`font-semibold ${cor.texto}`}>Aguardando sorteio do chaveamento</p>
          </Card>
        ) : confrontoAtual ? (
          <Link href={chaveamentoHref}>
            <Card className={`text-center transition ${cor.card}`}>
              <p className={`mb-3 text-sm font-extrabold tracking-widest uppercase ${cor.texto}`}>
                {confrontoAtual.etapa.nome}
              </p>
              <div className="flex min-w-0 items-center justify-center gap-1.5 sm:gap-3">
                <div className="min-w-0 flex-1">
                  {jogadorA ? (
                    <UsuarioUniforme usuario={jogadorA} size={28} lado="esquerda" className="justify-end text-slate-900 dark:text-slate-50" />
                  ) : (
                    <span className="text-sm font-semibold text-slate-400">Aguardando</span>
                  )}
                </div>
                <div className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 sm:gap-2 sm:px-3 ${cor.box}`}>
                  <span className={`min-w-4 text-center text-xl font-extrabold ${cor.texto}`}>{pontosA ?? "-"}</span>
                  <span className="text-slate-400">x</span>
                  <span className={`min-w-4 text-center text-xl font-extrabold ${cor.texto}`}>{pontosB ?? "-"}</span>
                </div>
                <div className="min-w-0 flex-1">
                  {jogadorB ? (
                    <UsuarioUniforme usuario={jogadorB} size={28} lado="direita" className="justify-start text-slate-900 dark:text-slate-50" />
                  ) : (
                    <span className="text-sm font-semibold text-slate-400">Aguardando</span>
                  )}
                </div>
              </div>
              <p className="mt-3 text-[11px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                Clique para ver o chaveamento
              </p>
            </Card>
          </Link>
        ) : resumo.status === "ativo" ? (
          <Link href={chaveamentoHref}>
            <Card className={`text-center transition ${cor.card}`}>
              <p className={`font-semibold ${cor.texto}`}>Aguardando definição do adversário</p>
              <p className="mt-2 text-[11px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                Clique para ver o chaveamento
              </p>
            </Card>
          </Link>
        ) : null}

        <div>
          <p className="mb-2 text-xs font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">
            Jogos a palpitar
          </p>
          <RodadasResumoLista rodadas={rodadas} href="/usuario/palpites" />
        </div>

        {visualizacaoHref && (
          <Link href={visualizacaoHref}>
            <Card className={`flex items-center justify-between transition ${cor.card}`}>
              <div>
                <p className={`text-xs font-bold tracking-widest uppercase ${cor.texto}`}>Divulgação dos palpites</p>
                <p className="font-semibold text-slate-900 dark:text-slate-50">Ver palpites da fase</p>
              </div>
              <IconArrowRight className={`h-5 w-5 ${cor.texto}`} />
            </Card>
          </Link>
        )}
      </div>
    </div>
  );
}





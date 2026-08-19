import { notFound } from "next/navigation";
import { requireUsuario } from "@/lib/auth/session";
import { requireSaveOwner } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { pontosDosConfrontos } from "@/lib/copa/pontosConfrontos";
import { resumoRodadasCompleto } from "@/lib/dashboard/resumoRodadas";
import { ChaveamentoAdmin, type EtapaAdminView, type ParticipanteAdmin } from "./ChaveamentoAdmin";
import { IniciarEncerrarBotoes } from "@/components/admin/IniciarEncerrarBotoes";
import { RodadasResumoLista } from "@/components/RodadasResumoLista";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { IconPlus, IconRefresh, IconTrophy } from "@/components/ui/icons";

const TIPO_LABEL: Record<string, string> = {
  LIGA: "Liga",
  COPA: "Copa",
  SUPERCOPA: "Supercopa",
};

export default async function CompeticaoDetailPage({
  params,
}: {
  params: Promise<{ saveId: string; temporadaId: string; competicaoId: string }>;
}) {
  const usuario = await requireUsuario();
  const { saveId, temporadaId, competicaoId } = await params;

  const save = await requireSaveOwner(saveId, usuario.id).catch(() => null);
  if (!save) notFound();

  const competicao = await prisma.competicao.findUnique({
    where: { id: competicaoId },
    include: {
      etapas: {
        orderBy: { ordem: "asc" },
        include: {
          confrontos: {
            orderBy: { ordem: "asc" },
            include: {
              participanteA: { include: { usuario: true } },
              participanteB: { include: { usuario: true } },
              vencedor: { include: { usuario: true } },
            },
          },
        },
      },
      copaParticipantes: { include: { usuario: true } },
    },
  });

  if (!competicao || competicao.temporadaId !== temporadaId) notFound();

  const totalConfrontos = competicao.etapas.reduce((acc, e) => acc + e.confrontos.length, 0);
  const usaChaveamento = competicao.tipo === "COPA" || competicao.tipo === "SUPERCOPA";

  const rodadas = await resumoRodadasCompleto(competicaoId);

  let etapasAdmin: EtapaAdminView[] = [];
  let candidatosDisponiveis: ParticipanteAdmin[] = [];

  if (usaChaveamento && totalConfrontos > 0) {
    const pontosDoParticipante = await pontosDosConfrontos(competicao.etapas);

    // Só conta como "alocado" quem ocupa um slot numa etapa ainda ABERTA — uma vez
    // que a etapa fecha, o vencedor fica livre pra ser posicionado manualmente na
    // próxima fase (junto com quem já tinha bye), em vez de ficar preso pra sempre
    // ao confronto histórico que já disputou.
    const idsAlocados = new Set(
      competicao.etapas
        .filter((e) => e.status === "ABERTA")
        .flatMap((e) =>
          e.confrontos.flatMap((c) => [c.participanteAId, c.participanteBId].filter((id): id is string => !!id))
        )
    );

    candidatosDisponiveis = competicao.copaParticipantes
      .filter((p) => p.ativo && !idsAlocados.has(p.id))
      .map((p) => ({
        copaParticipanteId: p.id,
        nome: p.usuario.nome,
        sigla: p.usuario.sigla,
        cores: p.usuario.cores,
        padraoUniforme: p.usuario.padraoUniforme,
      }));

    etapasAdmin = competicao.etapas.map((etapa) => ({
      id: etapa.id,
      nome: etapa.nome,
      status: etapa.status,
      confrontos: etapa.confrontos.map((c) => {
        const temConfrontoReal = Boolean(c.participanteA && c.participanteB);
        return {
          id: c.id,
          participanteA: c.participanteA
            ? {
                copaParticipanteId: c.participanteA.id,
                nome: c.participanteA.usuario.nome,
                sigla: c.participanteA.usuario.sigla,
                cores: c.participanteA.usuario.cores,
                padraoUniforme: c.participanteA.usuario.padraoUniforme,
              }
            : null,
          participanteB: c.participanteB
            ? {
                copaParticipanteId: c.participanteB.id,
                nome: c.participanteB.usuario.nome,
                sigla: c.participanteB.usuario.sigla,
                cores: c.participanteB.usuario.cores,
                padraoUniforme: c.participanteB.usuario.padraoUniforme,
              }
            : null,
          pontosA: temConfrontoReal ? pontosDoParticipante(c.participanteA?.usuarioId, etapa.id, c.id) : null,
          pontosB: temConfrontoReal ? pontosDoParticipante(c.participanteB?.usuarioId, etapa.id, c.id) : null,
          aVenceu: c.vencedorId != null && c.vencedorId === c.participanteAId,
          bVenceu: c.vencedorId != null && c.vencedorId === c.participanteBId,
        };
      }),
    }));
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={competicao.nome}
        backHref={`/admin/saves/${saveId}/temporadas/${temporadaId}`}
        backLabel="Voltar"
        subtitle={`${TIPO_LABEL[competicao.tipo]} · Cravada: ${competicao.pontosCravada}pts · Acerto: ${competicao.pontosAcerto}pts`}
        action={
          <IniciarEncerrarBotoes
            saveId={saveId}
            competicaoId={competicaoId}
            tipo={competicao.tipo}
            status={competicao.status}
          />
        }
      />

      {competicao.campeaoUsuarioId && (
        <div className="mb-4">
          <Badge tone="success">Campeão definido</Badge>
        </div>
      )}

      <p className="mb-2 text-xs font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">
        {competicao.tipo === "LIGA" ? "Rodadas" : "Fases"}
      </p>
      <div className="mb-4">
        <RodadasResumoLista rodadas={rodadas} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {(!usaChaveamento || totalConfrontos > 0) && (
          <LinkButton href={`/admin/saves/${saveId}/temporadas/${temporadaId}/competicoes/${competicaoId}/jogos/novo`}>
            <IconPlus className="h-4 w-4" />
            Cadastrar jogo
          </LinkButton>
        )}
        <LinkButton variant="outline" href="/admin/atualizar">
          <IconRefresh className="h-4 w-4" />
          Atualizar jogos
        </LinkButton>
        {competicao.tipo === "LIGA" && (
          <LinkButton
            variant="outline"
            href={`/admin/saves/${saveId}/temporadas/${temporadaId}/competicoes/${competicaoId}/classificacao`}
          >
            <IconTrophy className="h-4 w-4" />
            Classificação
          </LinkButton>
        )}
      </div>

      {usaChaveamento && totalConfrontos === 0 && (
        <LinkButton
          variant="outline"
          href={`/admin/saves/${saveId}/temporadas/${temporadaId}/competicoes/${competicaoId}/copa/gerar-confrontos`}
        >
          Gerar Confrontos
        </LinkButton>
      )}

      {usaChaveamento && etapasAdmin.length > 0 && (
        <div className="mb-6">
          <ChaveamentoAdmin etapas={etapasAdmin} candidatos={candidatosDisponiveis} saveId={saveId} />
        </div>
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { pontosDosConfrontos } from "@/lib/copa/pontosConfrontos";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { ChaveamentoFases, type EtapaView } from "@/components/ChaveamentoFases";

const TITULO = { COPA: "Chaveamento", SUPERCOPA: "Chaveamento da Supercopa" } as const;
const ROTA_BASE = { COPA: "chaveamento", SUPERCOPA: "supercopa" } as const;

export async function ChaveamentoArvore({
  competicaoId,
  usuarioId,
  tipo,
}: {
  competicaoId: string;
  usuarioId: string;
  tipo: "COPA" | "SUPERCOPA";
}) {
  const competicao = await prisma.competicao.findUnique({
    where: { id: competicaoId },
    include: {
      temporada: { include: { save: true } },
      etapas: {
        orderBy: { ordem: "asc" },
        include: {
          confrontos: {
            orderBy: { ordem: "asc" },
            include: {
              participanteA: { include: { usuario: true } },
              participanteB: { include: { usuario: true } },
              vencedor: true,
            },
          },
        },
      },
    },
  });
  if (!competicao || competicao.tipo !== tipo) notFound();

  const pontosDoParticipante = await pontosDosConfrontos(competicao.etapas);

  const etapas: EtapaView[] = competicao.etapas.map((etapa) => ({
    id: etapa.id,
    nome: etapa.nome,
    confrontos: etapa.confrontos.map((c) => {
      const souParticipanteA = c.participanteA?.usuarioId === usuarioId;
      const souParticipanteB = c.participanteB?.usuarioId === usuarioId;
      const temConfrontoReal = Boolean(c.participanteA && c.participanteB);
      return {
        id: c.id,
        participanteA: c.participanteA?.usuario ?? null,
        participanteB: c.participanteB?.usuario ?? null,
        pontosA: temConfrontoReal ? pontosDoParticipante(c.participanteA?.usuarioId, etapa.id, c.id) : null,
        pontosB: temConfrontoReal ? pontosDoParticipante(c.participanteB?.usuarioId, etapa.id, c.id) : null,
        aVenceu: c.vencedorId != null && c.vencedorId === c.participanteAId,
        bVenceu: c.vencedorId != null && c.vencedorId === c.participanteBId,
        souEuNoConfronto: souParticipanteA || souParticipanteB,
        emAndamento: Boolean(c.participanteAId && c.participanteBId && !c.vencedorId),
        decidido: c.vencedorId != null,
        temConfrontoReal,
      };
    }),
  }));

  const visualizacaoBaseHref = `/usuario/palpites/ver?saveId=${competicao.temporada.save.id}&temporadaId=${competicao.temporadaId}&competicaoId=${competicaoId}`;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title={TITULO[tipo]}
        backHref={`/usuario/competicoes/${competicaoId}/${ROTA_BASE[tipo]}`}
        backLabel={competicao.nome}
        action={
          <Badge tone={competicao.status === "ENCERRADA" ? "neutral" : "success"}>
            {competicao.status === "ENCERRADA" ? "Encerrada" : "Em andamento"}
          </Badge>
        }
      />

      {etapas.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          O chaveamento ainda não foi gerado pelo admin.
        </p>
      ) : (
        <ChaveamentoFases etapas={etapas} competicaoId={competicaoId} visualizacaoBaseHref={visualizacaoBaseHref} />
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import { requireUsuario } from "@/lib/auth/session";
import { requireSaveOwner } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { calcularByes } from "@/lib/copa/byes";
import { GerarConfrontosForm } from "./GerarConfrontosForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default async function GerarConfrontosPage({
  params,
}: {
  params: Promise<{ saveId: string; temporadaId: string; competicaoId: string }>;
}) {
  const usuario = await requireUsuario();
  const { saveId, temporadaId, competicaoId } = await params;

  const save = await requireSaveOwner(saveId, usuario.id).catch(() => null);
  if (!save) notFound();

  const competicao = await prisma.competicao.findUnique({ where: { id: competicaoId } });
  if (
    !competicao ||
    (competicao.tipo !== "COPA" && competicao.tipo !== "SUPERCOPA") ||
    competicao.temporadaId !== temporadaId
  )
    notFound();
  if (!competicao.numeroParticipantes || !competicao.formaGeracaoConfrontos) notFound();

  const jaGerado = await prisma.copaConfronto.count({ where: { etapa: { competicaoId } } });

  const participantes = await prisma.temporadaParticipante.findMany({
    where: { temporadaId, status: "APROVADO" },
    include: { usuario: true },
  });

  const { numByes } = calcularByes(competicao.numeroParticipantes);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Gerar Confrontos"
        backHref={`/admin/saves/${saveId}/temporadas/${temporadaId}/competicoes/${competicaoId}`}
        backLabel={competicao.nome}
      />

      {jaGerado > 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          O chaveamento desta competição já foi gerado.
        </p>
      ) : (
        <Card>
          <GerarConfrontosForm
            saveId={saveId}
            temporadaId={temporadaId}
            competicaoId={competicaoId}
            numeroParticipantes={competicao.numeroParticipantes}
            numByes={numByes}
            forma={competicao.formaGeracaoConfrontos}
            candidatos={participantes.map((p) => ({ usuarioId: p.usuarioId, nome: p.usuario.nome }))}
          />
        </Card>
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import { requireUsuario } from "@/lib/auth/session";
import { requireSaveOwner } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { calcularClassificacaoLiga, calcularRodadasCompletas } from "@/lib/scoring/classificacaoLiga";
import { PageHeader } from "@/components/ui/PageHeader";
import { ClassificacaoTabela } from "@/components/ClassificacaoTabela";

export default async function ClassificacaoAdminPage({
  params,
}: {
  params: Promise<{ saveId: string; temporadaId: string; competicaoId: string }>;
}) {
  const usuario = await requireUsuario();
  const { saveId, temporadaId, competicaoId } = await params;

  const save = await requireSaveOwner(saveId, usuario.id).catch(() => null);
  if (!save) notFound();

  const competicao = await prisma.competicao.findUnique({ where: { id: competicaoId } });
  if (!competicao || competicao.temporadaId !== temporadaId || competicao.tipo !== "LIGA") notFound();

  const [classificacao, rodadasInfo] = await Promise.all([
    calcularClassificacaoLiga(competicaoId),
    calcularRodadasCompletas(competicaoId),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Classificação"
        backHref={`/admin/saves/${saveId}/temporadas/${temporadaId}/competicoes/${competicaoId}`}
        backLabel={competicao.nome}
      />

      <ClassificacaoTabela linhas={classificacao} rodadas={rodadasInfo} />
    </div>
  );
}

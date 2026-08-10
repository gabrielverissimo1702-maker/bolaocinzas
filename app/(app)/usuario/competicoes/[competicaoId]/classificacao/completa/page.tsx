import { notFound } from "next/navigation";
import { requireUsuario } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { calcularClassificacaoLiga, calcularRodadasCompletas } from "@/lib/scoring/classificacaoLiga";
import { PageHeader } from "@/components/ui/PageHeader";
import { ClassificacaoTabela } from "@/components/ClassificacaoTabela";

export default async function ClassificacaoCompletaPage({
  params,
}: {
  params: Promise<{ competicaoId: string }>;
}) {
  const usuario = await requireUsuario();
  const { competicaoId } = await params;

  const competicao = await prisma.competicao.findUnique({ where: { id: competicaoId } });
  if (!competicao) notFound();

  const participante = await prisma.temporadaParticipante.findUnique({
    where: { temporadaId_usuarioId: { temporadaId: competicao.temporadaId, usuarioId: usuario.id } },
  });
  if (!participante || participante.status !== "APROVADO") notFound();

  const [classificacao, rodadasInfo] = await Promise.all([
    calcularClassificacaoLiga(competicaoId),
    calcularRodadasCompletas(competicaoId),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Classificação completa"
        backHref={`/usuario/competicoes/${competicaoId}/classificacao`}
        backLabel={competicao.nome}
      />

      <ClassificacaoTabela linhas={classificacao} meuUsuarioId={usuario.id} rodadas={rodadasInfo} />
    </div>
  );
}

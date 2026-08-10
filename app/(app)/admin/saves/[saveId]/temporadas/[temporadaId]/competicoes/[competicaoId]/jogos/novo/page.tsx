import { notFound } from "next/navigation";
import { requireUsuario } from "@/lib/auth/session";
import { requireSaveOwner } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { NovoJogoForm } from "./NovoJogoForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default async function NovoJogoPage({
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
    include: { etapas: { orderBy: { ordem: "asc" } } },
  });
  if (!competicao || competicao.temporadaId !== temporadaId) notFound();

  const times = await prisma.time.findMany({ where: { saveId }, orderBy: { nome: "asc" } });

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Cadastrar jogo"
        backHref={`/admin/saves/${saveId}/temporadas/${temporadaId}/competicoes/${competicaoId}`}
        backLabel={competicao.nome}
      />

      {competicao.etapas.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Esta competição ainda não tem etapas disponíveis.
        </p>
      ) : times.length < 2 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Cadastre ao menos dois times neste save antes de criar um jogo.
        </p>
      ) : (
        <Card>
          <NovoJogoForm
            saveId={saveId}
            temporadaId={temporadaId}
            competicaoId={competicaoId}
            etapas={competicao.etapas}
            times={times}
          />
        </Card>
      )}
    </div>
  );
}

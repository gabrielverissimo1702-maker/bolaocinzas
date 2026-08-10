import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUsuario } from "@/lib/auth/session";
import { requireSaveOwner } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { IconPlus, IconTrophy } from "@/components/ui/icons";

const TIPO_LABEL: Record<string, string> = {
  LIGA: "Liga",
  COPA: "Copa",
  SUPERCOPA: "Supercopa",
};

export default async function TemporadaDetailPage({
  params,
}: {
  params: Promise<{ saveId: string; temporadaId: string }>;
}) {
  const usuario = await requireUsuario();
  const { saveId, temporadaId } = await params;

  const save = await requireSaveOwner(saveId, usuario.id).catch(() => null);
  if (!save) notFound();

  const temporada = await prisma.temporada.findUnique({ where: { id: temporadaId } });
  if (!temporada || temporada.saveId !== saveId) notFound();

  const competicoes = await prisma.competicao.findMany({
    where: { temporadaId },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { etapas: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={temporada.nome}
        backHref={`/admin/saves/${saveId}/temporadas`}
        backLabel="Temporadas"
        action={
          <LinkButton href={`/admin/saves/${saveId}/temporadas/${temporadaId}/competicoes/nova`}>
            <IconPlus className="h-4 w-4" />
            Criar competição
          </LinkButton>
        }
      />

      <ul className="flex flex-col gap-3">
        {competicoes.map((c) => (
          <li key={c.id}>
            <Link href={`/admin/saves/${saveId}/temporadas/${temporadaId}/competicoes/${c.id}`}>
              <Card className="flex items-center gap-4 transition hover:border-emerald-400 dark:hover:border-emerald-600">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <IconTrophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{c.nome}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {TIPO_LABEL[c.tipo]} · {c._count.etapas} etapa(s)
                    {c.campeaoUsuarioId && " · Campeão definido"}
                  </p>
                </div>
              </Card>
            </Link>
          </li>
        ))}
        {competicoes.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma competição criada ainda.</p>
        )}
      </ul>
    </div>
  );
}

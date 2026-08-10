import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUsuario } from "@/lib/auth/session";
import { requireSaveOwner } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { alternarStatusTemporada } from "@/app/actions/temporadas";
import { NovaTemporadaForm } from "./NovaTemporadaForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default async function TemporadasPage({
  params,
}: {
  params: Promise<{ saveId: string }>;
}) {
  const usuario = await requireUsuario();
  const { saveId } = await params;

  const save = await requireSaveOwner(saveId, usuario.id).catch(() => null);
  if (!save) notFound();

  const temporadas = await prisma.temporada.findMany({
    where: { saveId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { competicoes: true, participantes: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Temporadas" backHref={`/admin/saves/${saveId}`} backLabel={save.nome} />

      <Card className="mb-6">
        <NovaTemporadaForm saveId={saveId} />
      </Card>

      <ul className="flex flex-col gap-3">
        {temporadas.map((temporada) => (
          <Card key={temporada.id} className="flex items-center justify-between">
            <Link href={`/admin/saves/${saveId}/temporadas/${temporada.id}`} className="flex-1">
              <p className="font-semibold text-slate-900 hover:underline dark:text-slate-50">
                {temporada.nome}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {temporada._count.competicoes} competição(ões) · {temporada._count.participantes} participante(s)
              </p>
            </Link>
            <div className="flex items-center gap-3">
              <Badge tone={temporada.status === "ABERTA" ? "success" : "neutral"}>
                {temporada.status === "ABERTA" ? "Inscrições abertas" : "Inscrições fechadas"}
              </Badge>
              <form action={alternarStatusTemporada.bind(null, temporada.id, saveId)}>
                <Button type="submit" variant="outline" size="sm">
                  {temporada.status === "ABERTA" ? "Fechar" : "Abrir"}
                </Button>
              </form>
            </div>
          </Card>
        ))}
        {temporadas.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma temporada criada ainda.</p>
        )}
      </ul>
    </div>
  );
}

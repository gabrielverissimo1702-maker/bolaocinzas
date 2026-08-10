import { notFound } from "next/navigation";
import { requireUsuario } from "@/lib/auth/session";
import { requireSaveOwner } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { NovoTimeForm } from "./NovoTimeForm";
import { TimeCard } from "./TimeCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default async function TimesPage({
  params,
}: {
  params: Promise<{ saveId: string }>;
}) {
  const usuario = await requireUsuario();
  const { saveId } = await params;

  const save = await requireSaveOwner(saveId, usuario.id).catch(() => null);
  if (!save) notFound();

  const times = await prisma.time.findMany({
    where: { saveId },
    orderBy: { nome: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Times" backHref={`/admin/saves/${saveId}`} backLabel={save.nome} />

      <Card className="mb-6">
        <NovoTimeForm saveId={saveId} />
      </Card>

      <ul className="grid gap-3 sm:grid-cols-2">
        {times.map((time) => (
          <TimeCard key={time.id} time={time} saveId={saveId} />
        ))}
        {times.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum time cadastrado ainda.</p>
        )}
      </ul>
    </div>
  );
}

import Link from "next/link";
import { requireUsuario } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { NovoSaveForm } from "./NovoSaveForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { IconLayers } from "@/components/ui/icons";

export default async function AdminSavesPage() {
  const usuario = await requireUsuario();

  const saves = await prisma.save.findMany({
    where: { criadorId: usuario.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { temporadas: true, times: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Meus Saves" />

      <Card className="mb-6">
        <NovoSaveForm />
      </Card>

      <ul className="flex flex-col gap-3">
        {saves.map((save) => (
          <li key={save.id}>
            <Link href={`/admin/saves/${save.id}`}>
              <Card className="flex items-center gap-4 transition hover:border-emerald-400 dark:hover:border-emerald-600">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <IconLayers className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{save.nome}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Código: <span className="font-mono font-semibold">{save.codigoAcesso}</span> ·{" "}
                    {save._count.temporadas} temporada(s) · {save._count.times} time(s)
                  </p>
                </div>
              </Card>
            </Link>
          </li>
        ))}
        {saves.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Você ainda não criou nenhum save.</p>
        )}
      </ul>
    </div>
  );
}

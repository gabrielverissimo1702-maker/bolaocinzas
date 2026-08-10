import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUsuario } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { IconLayers, IconShield, IconUsers } from "@/components/ui/icons";

export default async function AdminSaveDetailPage({
  params,
}: {
  params: Promise<{ saveId: string }>;
}) {
  const usuario = await requireUsuario();
  const { saveId } = await params;

  const save = await prisma.save.findUnique({ where: { id: saveId } });
  if (!save || save.criadorId !== usuario.id) notFound();

  const links = [
    { href: `/admin/saves/${saveId}/temporadas`, label: "Temporadas", desc: "Criar e gerenciar temporadas", icon: IconLayers },
    { href: `/admin/saves/${saveId}/times`, label: "Times", desc: "Cadastrar times reutilizáveis", icon: IconShield },
    { href: `/admin/saves/${saveId}/participantes`, label: "Participantes", desc: "Aprovar, rejeitar ou remover", icon: IconUsers },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={save.nome}
        subtitle={`Código de acesso: ${save.codigoAcesso}`}
        backHref="/admin/saves"
        backLabel="Meus Saves"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <Card className="h-full transition hover:border-emerald-400 dark:hover:border-emerald-600">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <p className="font-semibold text-slate-900 dark:text-slate-50">{link.label}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{link.desc}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

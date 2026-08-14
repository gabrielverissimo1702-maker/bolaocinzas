import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUsuario } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TipoTag } from "@/components/ui/TipoTag";
import { IconShield, IconUsers, IconPlus } from "@/components/ui/icons";

const STATUS_LABEL: Record<string, string> = {
  RASCUNHO: "Rascunho",
  EM_ANDAMENTO: "Em andamento",
  ENCERRADA: "Encerrada",
};

const STATUS_TONE: Record<string, "warning" | "success" | "neutral"> = {
  RASCUNHO: "warning",
  EM_ANDAMENTO: "success",
  ENCERRADA: "neutral",
};

export default async function AdminSaveDetailPage({
  params,
}: {
  params: Promise<{ saveId: string }>;
}) {
  const usuario = await requireUsuario();
  const { saveId } = await params;

  const save = await prisma.save.findUnique({ where: { id: saveId } });
  if (!save || save.criadorId !== usuario.id) notFound();

  const temporadas = await prisma.temporada.findMany({
    where: { saveId },
    orderBy: { createdAt: "desc" },
    include: { competicoes: { orderBy: { createdAt: "asc" } } },
  });

  const links = [
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

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
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

      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">Temporadas</p>
        <Link
          href={`/admin/saves/${saveId}/temporadas`}
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
        >
          <IconPlus className="h-3.5 w-3.5" />
          Nova temporada
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        {temporadas.map((temporada) => (
          <div key={temporada.id}>
            <Link
              href={`/admin/saves/${saveId}/temporadas/${temporada.id}`}
              className="mb-2 inline-block font-semibold text-slate-900 hover:underline dark:text-slate-50"
            >
              {temporada.nome}
            </Link>
            <div className="flex flex-col gap-2">
              {temporada.competicoes.map((competicao) => (
                <Link
                  key={competicao.id}
                  href={`/admin/saves/${saveId}/temporadas/${temporada.id}/competicoes/${competicao.id}`}
                >
                  <Card className="flex items-center justify-between py-3 transition hover:border-slate-400 dark:hover:border-slate-600">
                    <div className="flex min-w-0 items-center gap-2">
                      <TipoTag tipo={competicao.tipo} />
                      <p className="truncate font-medium text-slate-900 dark:text-slate-50">{competicao.nome}</p>
                    </div>
                    <Badge tone={STATUS_TONE[competicao.status]}>{STATUS_LABEL[competicao.status]}</Badge>
                  </Card>
                </Link>
              ))}
              {temporada.competicoes.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma competição criada ainda.</p>
              )}
            </div>
          </div>
        ))}
        {temporadas.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Este save ainda não tem temporadas.</p>
        )}
      </div>
    </div>
  );
}

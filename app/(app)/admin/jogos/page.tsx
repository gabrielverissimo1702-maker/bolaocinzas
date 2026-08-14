import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { IconPlus, IconRefresh } from "@/components/ui/icons";

export default function JogosPage() {
  const links = [
    { href: "/admin/jogos/novo", label: "Cadastrar jogos", desc: "Criar um novo jogo em qualquer competição", icon: IconPlus },
    { href: "/admin/atualizar", label: "Atualizar jogos", desc: "Editar placar, data/hora ou excluir jogos existentes", icon: IconRefresh },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Jogos" backHref="/" backLabel="Início" />

      <div className="grid gap-4 sm:grid-cols-2">
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

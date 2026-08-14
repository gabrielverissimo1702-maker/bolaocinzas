"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./ui/Logo";
import { IconHome, IconLayers, IconTrophy, IconTarget, IconUser, IconLogOut } from "./ui/icons";
import { sair } from "@/app/actions/auth";
import { useModo } from "@/lib/ModoContext";

const linksUsuario = [
  { href: "/", label: "Início", icon: IconHome },
  { href: "/usuario/saves", label: "Meus Saves", icon: IconLayers },
  { href: "/usuario/palpites", label: "Palpites", icon: IconTrophy },
];

const linksAdmin = [
  { href: "/", label: "Início", icon: IconHome },
  { href: "/admin/saves", label: "Saves", icon: IconLayers },
  { href: "/admin/jogos", label: "Jogos", icon: IconTarget },
];

export function Sidebar({ nome }: { nome: string }) {
  const pathname = usePathname();
  const { modo, setModo } = useModo();
  const links = modo === "USUARIO" ? linksUsuario : linksAdmin;

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950">
      <div className="border-b border-slate-200 px-5 py-5 dark:border-slate-800">
        <Logo />
      </div>

      <div className="px-3 pt-3">
        <div className="inline-flex w-full rounded-lg border border-slate-200 p-1 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setModo("USUARIO")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              modo === "USUARIO"
                ? "bg-slate-700 text-white dark:bg-slate-300 dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Usuário
          </button>
          <button
            type="button"
            onClick={() => setModo("ADMIN")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              modo === "ADMIN"
                ? "bg-slate-700 text-white dark:bg-slate-300 dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-slate-200 text-slate-900 dark:bg-slate-700/60 dark:text-slate-100"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {link.label}
                </Link>
              </li>
            );
          })}
          <li>
            <Link
              href="/usuario/perfil"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname.startsWith("/usuario/perfil")
                  ? "bg-slate-200 text-slate-900 dark:bg-slate-700/60 dark:text-slate-100"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <IconUser className="h-4.5 w-4.5" />
              Perfil
            </Link>
          </li>
        </ul>
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="flex items-center justify-between rounded-lg px-2 py-2">
          <span className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">{nome}</span>
          <form action={sair}>
            <button
              type="submit"
              title="Sair"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            >
              <IconLogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

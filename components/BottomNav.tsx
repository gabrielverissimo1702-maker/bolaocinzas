"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconLayers, IconTrophy, IconPlus, IconRefresh, IconUser } from "./ui/icons";
import { useModo } from "@/lib/ModoContext";

const linksUsuario = [
  { href: "/", label: "Início", icon: IconHome },
  { href: "/usuario/saves", label: "Saves", icon: IconLayers },
  { href: "/usuario/palpites", label: "Palpites", icon: IconTrophy },
  { href: "/usuario/perfil", label: "Perfil", icon: IconUser },
];

const linksAdmin = [
  { href: "/", label: "Início", icon: IconHome },
  { href: "/admin/saves", label: "Adicionar", icon: IconPlus },
  { href: "/admin/atualizar", label: "Atualizar", icon: IconRefresh },
  { href: "/usuario/perfil", label: "Perfil", icon: IconUser },
];

export function BottomNav() {
  const pathname = usePathname();
  const { modo, setModo } = useModo();
  const links = modo === "USUARIO" ? linksUsuario : linksAdmin;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-0.5 border-t border-slate-200 bg-white px-1.5 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950">
      <div className="flex min-w-0 flex-1 items-center justify-around">
        {links.map((link) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-1.5 py-1.5 text-[10px] font-medium transition ${
                active
                  ? "text-slate-900 dark:text-slate-100"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="flex shrink-0 rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setModo("USUARIO")}
          aria-label="Modo usuário"
          className={`rounded-md px-1.5 py-1.5 text-[10px] font-bold transition ${
            modo === "USUARIO"
              ? "bg-slate-700 text-white dark:bg-slate-300 dark:text-slate-900"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          USR
        </button>
        <button
          type="button"
          onClick={() => setModo("ADMIN")}
          aria-label="Modo admin"
          className={`rounded-md px-1.5 py-1.5 text-[10px] font-bold transition ${
            modo === "ADMIN"
              ? "bg-slate-700 text-white dark:bg-slate-300 dark:text-slate-900"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          ADM
        </button>
      </div>
    </nav>
  );
}

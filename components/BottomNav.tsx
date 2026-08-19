"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconLayers, IconTrophy, IconTarget, IconUser, IconClock } from "./ui/icons";
import { useModo } from "@/lib/ModoContext";

const linksUsuario = [
  { href: "/", label: "Início", icon: IconHome },
  { href: "/usuario/saves", label: "Saves", icon: IconLayers },
  { href: "/usuario/palpites", label: "Palpites", icon: IconTrophy },
  { href: "/usuario/historico", label: "Histórico", icon: IconClock },
  { href: "/usuario/perfil", label: "Perfil", icon: IconUser },
];

const linksAdmin = [
  { href: "/", label: "Início", icon: IconHome },
  { href: "/admin/saves", label: "Saves", icon: IconLayers },
  { href: "/admin/jogos", label: "Jogos", icon: IconTarget },
  { href: "/usuario/perfil", label: "Perfil", icon: IconUser },
];

export function BottomNav() {
  const pathname = usePathname();
  const { modo, setModo } = useModo();
  const links = modo === "USUARIO" ? linksUsuario : linksAdmin;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-0.5 border-t border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 px-1.5 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
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
                  ? "text-slate-100"
                  : "text-slate-400"
              }`}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </div>

      <div className="flex shrink-0 rounded-lg border border-slate-700 p-0.5">
        <button
          type="button"
          onClick={() => setModo("USUARIO")}
          aria-label="Modo usuÃ¡rio"
          className={`rounded-md px-1.5 py-1.5 text-[10px] font-bold transition ${
            modo === "USUARIO"
              ? "bg-slate-300 text-slate-900"
              : "text-slate-400"
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
              ? "bg-slate-300 text-slate-900"
              : "text-slate-400"
          }`}
        >
          ADM
        </button>
      </div>
    </nav>
  );
}



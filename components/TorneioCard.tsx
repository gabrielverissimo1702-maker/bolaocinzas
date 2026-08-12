import Link from "next/link";
import { TipoTag } from "@/components/ui/TipoTag";
import { ProgressoCircular } from "@/components/ui/ProgressoCircular";
import { IconTrophy, IconCalendar } from "@/components/ui/icons";
import type { TorneioResumo } from "@/lib/dashboard/torneiosUsuario";
import { TIMEZONE_BRASIL } from "@/lib/timezone";

function formatarData(data: Date | null) {
  if (!data) return "Sem jogos";
  return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: TIMEZONE_BRASIL });
}

export function TorneioCard({ torneio }: { torneio: TorneioResumo }) {
  return (
    <Link
      href={torneio.href}
      className="block rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-emerald-600/60"
    >
      <div className="mb-3 flex items-center justify-between">
        <TipoTag tipo={torneio.tipo} />
        <IconTrophy className="h-5 w-5 text-emerald-400" />
      </div>

      <p className="text-lg font-bold text-white">{torneio.saveNome}</p>
      <p className="text-sm text-slate-400">{torneio.competicaoNome}</p>

      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-slate-800/50 p-3">
        <div className="min-w-0">
          <p
            className={`text-[10px] font-semibold tracking-wide uppercase ${
              torneio.eliminado ? "text-red-400" : "text-slate-400"
            }`}
          >
            {torneio.eliminado ? "Eliminado" : "Fase atual"}
          </p>
          <p className="truncate text-base font-bold text-white">{torneio.faseAtual ?? "-"}</p>
        </div>
        <ProgressoCircular enviados={torneio.enviados} total={torneio.total} />
      </div>

      <div className="mt-3 flex flex-col gap-1 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <IconCalendar className="h-3.5 w-3.5 shrink-0" />
          Início: {formatarData(torneio.dataInicio)}
        </span>
        <span className="flex items-center gap-1.5">
          <IconCalendar className="h-3.5 w-3.5 shrink-0" />
          Final: {formatarData(torneio.dataFinal)}
        </span>
      </div>
    </Link>
  );
}

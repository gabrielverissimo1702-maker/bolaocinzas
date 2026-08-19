import Link from "next/link";
import { Jersey } from "@/components/ui/Jersey";
import { TIMEZONE_BRASIL } from "@/lib/timezone";

export interface TimeResumo {
  nome: string;
  sigla: string;
  cores: string[];
  padraoUniforme: "SOLIDO" | "LISTRAS_VERTICAIS" | "LISTRAS_HORIZONTAIS" | "LISTRAS_DIAGONAIS" | "MANGAS_CONTRASTANTES" | "GOLA_CONTRASTANTE" | "BICOLOR" | "DEGRADE";
}

export interface JogoResumoData {
  id: string;
  timeCasa: TimeResumo;
  timeVisitante: TimeResumo;
  dataHora: Date | string;
  placarCasa?: number | null;
  placarVisitante?: number | null;
}

function formatarData(dataHora: Date | string) {
  const data = new Date(dataHora);
  const dia = data.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: TIMEZONE_BRASIL,
  });
  const hora = data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE_BRASIL,
  });
  return `${dia} · ${hora}`;
}

const inputClass =
  "w-7 min-w-0 bg-transparent text-center text-base font-extrabold text-white outline-none [appearance:textfield] sm:text-lg [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export function JogoResumo({
  jogo,
  cabecalho,
  href,
  compacto = false,
  editavel = false,
  travado = false,
  meuPalpite,
}: {
  jogo: JogoResumoData;
  cabecalho?: string;
  href?: string;
  compacto?: boolean;
  editavel?: boolean;
  travado?: boolean;
  meuPalpite?: { placarCasa: number; placarVisitante: number } | null;
}) {
  const tamanhoJersey = compacto ? 30 : 40;
  const encerrado = jogo.placarCasa != null;
  const statusLabel = encerrado ? "Encerrado" : travado ? "Encerrado" : "Agendado";
  const podeEditar = editavel && !encerrado && !travado;

  const conteudo = (
    <>
      <div className="relative mb-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
        {cabecalho && (
          <span className="text-[10px] font-bold tracking-widest text-slate-300/80 uppercase">{cabecalho}</span>
        )}
        {cabecalho && <span className="text-slate-500/40">|</span>}
        <span className="text-[10px] font-semibold tracking-wide text-slate-400/80">{formatarData(jogo.dataHora)}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold tracking-widest uppercase ring-1 ${
            encerrado || travado
              ? "bg-slate-400/10 text-slate-300 ring-slate-400/20"
              : "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="relative flex items-center justify-center gap-2 sm:gap-3">
        <div className="flex min-w-0 flex-1 flex-col items-end gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-xs font-extrabold tracking-wide text-white uppercase sm:text-sm">
              {jogo.timeCasa.sigla}
            </span>
            <Jersey {...jogo.timeCasa} size={tamanhoJersey} />
          </div>
          {!compacto && (
            <p className="max-w-[120px] truncate text-[10px] text-slate-400/70">{jogo.timeCasa.nome}</p>
          )}
        </div>

        <div
          className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.25)] ${
            podeEditar
              ? "border-emerald-500/50 bg-slate-800/90"
              : "border-slate-600/40 bg-slate-800/70"
          }`}
        >
          {podeEditar && <input type="hidden" name="jogoId" value={jogo.id} />}
          {podeEditar ? (
            <input
              name={`placarCasa_${jogo.id}`}
              type="number"
              min={0}
              max={99}
              defaultValue={meuPalpite?.placarCasa ?? undefined}
              className={inputClass}
            />
          ) : (
            <span className="min-w-[1ch] text-center text-base font-extrabold text-white sm:text-lg">
              {jogo.placarCasa ?? "-"}
            </span>
          )}
          <span className="text-slate-400">x</span>
          {podeEditar ? (
            <input
              name={`placarVisitante_${jogo.id}`}
              type="number"
              min={0}
              max={99}
              defaultValue={meuPalpite?.placarVisitante ?? undefined}
              className={inputClass}
            />
          ) : (
            <span className="min-w-[1ch] text-center text-base font-extrabold text-white sm:text-lg">
              {jogo.placarVisitante ?? "-"}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
          <div className="flex items-center gap-1.5">
            <Jersey {...jogo.timeVisitante} size={tamanhoJersey} />
            <span className="truncate text-xs font-extrabold tracking-wide text-white uppercase sm:text-sm">
              {jogo.timeVisitante.sigla}
            </span>
          </div>
          {!compacto && (
            <p className="max-w-[120px] truncate text-[10px] text-slate-400/70">{jogo.timeVisitante.nome}</p>
          )}
        </div>
      </div>
    </>
  );

  const classeCard =
    "relative overflow-hidden rounded-xl border border-slate-700/60 bg-gradient-to-b from-[#1a2035] to-[#0d1220] p-4 shadow-lg transition";
  const glow = (
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(148,163,184,0.14),transparent_65%)]" />
  );

  if (href) {
    return (
      <Link href={href} className={`${classeCard} block hover:border-emerald-500/60`}>
        {glow}
        {conteudo}
      </Link>
    );
  }

  return (
    <div className={classeCard}>
      {glow}
      {conteudo}
    </div>
  );
}

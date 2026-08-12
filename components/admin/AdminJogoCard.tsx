"use client";

import { Jersey } from "@/components/ui/Jersey";
import type { JogoResumoData } from "@/components/JogoResumo";
import { removerJogo } from "@/app/actions/jogos";
import { paraDatetimeLocalBrasilia } from "@/lib/timezone";

const scoreInputClass =
  "w-7 min-w-0 bg-transparent text-center text-base font-extrabold text-white outline-none [appearance:textfield] sm:text-lg [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export function AdminJogoCard({
  jogo,
  cabecalho,
  saveId,
  temporadaId,
  competicaoId,
}: {
  jogo: JogoResumoData;
  cabecalho?: string;
  saveId: string;
  temporadaId: string;
  competicaoId: string;
}) {
  const tamanhoJersey = 30;

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-700/60 bg-gradient-to-b from-[#1a2035] to-[#0d1220] p-4 shadow-lg">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(148,163,184,0.14),transparent_65%)]" />

      <input type="hidden" name="jogoId" value={jogo.id} />

      <div className="relative mb-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center">
        {cabecalho && (
          <span className="text-[10px] font-bold tracking-widest text-slate-300/80 uppercase">{cabecalho}</span>
        )}
        {cabecalho && <span className="text-slate-500/40">|</span>}
        <input
          type="datetime-local"
          name={`dataHora_${jogo.id}`}
          defaultValue={paraDatetimeLocalBrasilia(jogo.dataHora)}
          className="rounded-md border border-slate-700/60 bg-slate-900/70 px-1.5 py-0.5 text-[11px] font-semibold text-slate-300 outline-none focus:border-emerald-500"
        />
      </div>

      <div className="relative flex items-center justify-center gap-2 sm:gap-3">
        <div className="flex min-w-0 flex-1 flex-col items-end gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-xs font-extrabold tracking-wide text-white uppercase sm:text-sm">
              {jogo.timeCasa.sigla}
            </span>
            <Jersey {...jogo.timeCasa} size={tamanhoJersey} />
          </div>
          <p className="max-w-[120px] truncate text-[10px] text-slate-400/70">{jogo.timeCasa.nome}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-lg border border-emerald-500/50 bg-slate-800/90 px-3 py-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.25)]">
          <input
            name={`placarCasa_${jogo.id}`}
            type="number"
            min={0}
            max={99}
            defaultValue={jogo.placarCasa ?? undefined}
            className={scoreInputClass}
          />
          <span className="text-slate-400">x</span>
          <input
            name={`placarVisitante_${jogo.id}`}
            type="number"
            min={0}
            max={99}
            defaultValue={jogo.placarVisitante ?? undefined}
            className={scoreInputClass}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
          <div className="flex items-center gap-1.5">
            <Jersey {...jogo.timeVisitante} size={tamanhoJersey} />
            <span className="truncate text-xs font-extrabold tracking-wide text-white uppercase sm:text-sm">
              {jogo.timeVisitante.sigla}
            </span>
          </div>
          <p className="max-w-[120px] truncate text-[10px] text-slate-400/70">{jogo.timeVisitante.nome}</p>
        </div>
      </div>

      <div className="relative mt-3 flex justify-center">
        <button
          type="submit"
          formAction={removerJogo.bind(null, jogo.id, saveId, temporadaId, competicaoId)}
          formNoValidate
          onClick={(e) => {
            if (!confirm("Excluir este jogo permanentemente?")) e.preventDefault();
          }}
          className="text-xs font-semibold text-red-400 hover:text-red-300 hover:underline"
        >
          Excluir jogo
        </button>
      </div>
    </div>
  );
}

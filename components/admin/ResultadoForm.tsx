"use client";

import { useActionState } from "react";
import { lancarResultado, type ResultadosActionState } from "@/app/actions/resultados";

const initialState: ResultadosActionState = {};

export function ResultadoForm({ jogoId, saveId }: { jogoId: string; saveId: string }) {
  const action = lancarResultado.bind(null, saveId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex items-center gap-1.5">
      <input type="hidden" name="jogoId" value={jogoId} />
      <input
        name="placarCasa"
        type="number"
        min={0}
        max={99}
        required
        placeholder="0"
        className="w-12 rounded-md border border-slate-300 px-1 py-1 text-center text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
      />
      <span className="text-slate-400">x</span>
      <input
        name="placarVisitante"
        type="number"
        min={0}
        max={99}
        required
        placeholder="0"
        className="w-12 rounded-md border border-slate-300 px-1 py-1 text-center text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:text-slate-950"
      >
        {pending ? "..." : "Lançar"}
      </button>
      {state.error && <span className="text-xs text-red-600 dark:text-red-400">{state.error}</span>}
    </form>
  );
}

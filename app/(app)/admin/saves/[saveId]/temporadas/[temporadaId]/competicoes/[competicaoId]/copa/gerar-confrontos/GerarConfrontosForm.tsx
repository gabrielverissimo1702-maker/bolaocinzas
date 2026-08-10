"use client";

import { useActionState, useState } from "react";
import { gerarConfrontosCopa, type CopaActionState } from "@/app/actions/copa";
import { Button } from "@/components/ui/Button";
import type { FormaGeracaoConfrontos } from "@/app/generated/prisma/enums";

const initialState: CopaActionState = {};

export function GerarConfrontosForm({
  saveId,
  temporadaId,
  competicaoId,
  numeroParticipantes,
  numByes,
  forma,
  candidatos,
}: {
  saveId: string;
  temporadaId: string;
  competicaoId: string;
  numeroParticipantes: number;
  numByes: number;
  forma: FormaGeracaoConfrontos;
  candidatos: { usuarioId: string; nome: string }[];
}) {
  const action = gerarConfrontosCopa.bind(null, saveId, temporadaId, competicaoId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());

  function toggle(usuarioId: string) {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(usuarioId)) next.delete(usuarioId);
      else next.add(usuarioId);
      return next;
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Selecione exatamente <strong>{numeroParticipantes}</strong> participante(s)
        {forma === "HIBRIDO" && <> e marque <strong>{numByes}</strong> para receber bye</>}.
      </p>

      <ul className="flex flex-col divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
        {candidatos.map((c) => (
          <li key={c.usuarioId} className="flex items-center gap-3 px-3 py-2.5">
            <input
              type="checkbox"
              name="participantes"
              value={c.usuarioId}
              checked={selecionados.has(c.usuarioId)}
              onChange={() => toggle(c.usuarioId)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="flex-1 text-sm font-medium text-slate-900 dark:text-slate-50">{c.nome}</span>

            {forma === "MANUAL" && selecionados.has(c.usuarioId) && (
              <input
                type="number"
                name={`posicao_${c.usuarioId}`}
                min={1}
                max={candidatos.length}
                placeholder="posição"
                className="w-20 rounded-md border border-slate-300 px-2 py-1 text-center text-sm dark:border-slate-700 dark:bg-slate-800"
              />
            )}

            {forma === "HIBRIDO" && selecionados.has(c.usuarioId) && (
              <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <input
                  type="checkbox"
                  name={`bye_${c.usuarioId}`}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                bye
              </label>
            )}
          </li>
        ))}
        {candidatos.length === 0 && (
          <li className="px-3 py-4 text-sm text-slate-400 dark:text-slate-500">
            Nenhum participante aprovado nesta temporada ainda.
          </li>
        )}
      </ul>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Selecionados: {selecionados.size} / {numeroParticipantes}
      </p>

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <Button type="submit" disabled={pending || selecionados.size !== numeroParticipantes}>
        {pending ? "Gerando..." : "Gerar chaveamento"}
      </Button>
    </form>
  );
}

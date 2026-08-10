"use client";

import { useState } from "react";
import { PalpitesRodadaCard, type JogoParaPalpitar } from "./PalpitesRodadaCard";

export interface RodadaComJogos {
  id: string;
  nome: string;
  ordem: number;
  jogos: JogoParaPalpitar[];
}

export function PalpitesComRodadas({
  rodadas,
  meuUsuarioId,
  etapaInicialId,
}: {
  rodadas: RodadaComJogos[];
  meuUsuarioId: string;
  etapaInicialId?: string;
}) {
  const indexEtapaInicial = etapaInicialId ? rodadas.findIndex((r) => r.id === etapaInicialId) : -1;
  const primeiraComJogoPendente = rodadas.findIndex((r) => r.jogos.some((j) => j.placarCasa == null));
  const [selecionada, setSelecionada] = useState(
    indexEtapaInicial >= 0 ? indexEtapaInicial : primeiraComJogoPendente >= 0 ? primeiraComJogoPendente : 0
  );

  const rodada = rodadas[selecionada];

  return (
    <div>
      <div className="mb-4 flex flex-wrap justify-center gap-2">
        {rodadas.map((r, i) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setSelecionada(i)}
            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-bold transition ${
              i === selecionada
                ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950"
                : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            {r.ordem}
          </button>
        ))}
      </div>

      {rodada && (
        <PalpitesRodadaCard
          etapaNome={rodada.nome}
          jogos={rodada.jogos}
          meuUsuarioId={meuUsuarioId}
          layoutRevelacao="carrossel"
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Jersey } from "@/components/ui/Jersey";

const PADROES = [
  { value: "LISTRAS_VERTICAIS", label: "Listras verticais" },
  { value: "LISTRAS_HORIZONTAIS", label: "Listras horizontais" },
  { value: "LISTRAS_DIAGONAIS", label: "Listras diagonais" },
  { value: "MANGAS_CONTRASTANTES", label: "Mangas contrastantes" },
  { value: "GOLA_CONTRASTANTE", label: "Gola contrastante" },
  { value: "BICOLOR", label: "Bicolor" },
  { value: "DEGRADE", label: "Degradê" },
] as const;

const CORES_PADRAO = ["#16a34a", "#ffffff", "#1B1B1B", "#E30613"];

export function UniformePicker({
  siglaInicial = "",
  coresIniciais = CORES_PADRAO,
  padraoInicial = "SOLIDO",
  corSiglaInicial = "#FFFFFF",
  siglaLabel = "Sigla",
  siglaPlaceholder = "ex: FLA",
}: {
  siglaInicial?: string;
  coresIniciais?: string[];
  padraoInicial?:
    | "SOLIDO"
    | "LISTRAS_VERTICAIS"
    | "LISTRAS_HORIZONTAIS"
    | "LISTRAS_DIAGONAIS"
    | "MANGAS_CONTRASTANTES"
    | "GOLA_CONTRASTANTE"
    | "BICOLOR"
    | "DEGRADE";
  corSiglaInicial?: string;
  siglaLabel?: string;
  siglaPlaceholder?: string;
}) {
  const [sigla, setSigla] = useState(siglaInicial);
  const [numeroCores, setNumeroCores] = useState(Math.max(1, Math.min(4, coresIniciais.length || 1)));
  const [cores, setCores] = useState<string[]>(
    coresIniciais.length > 0 ? [...coresIniciais, ...CORES_PADRAO].slice(0, 4) : CORES_PADRAO
  );
  const [padrao, setPadrao] = useState<(typeof PADROES)[number]["value"]>(
    padraoInicial === "SOLIDO" ? "LISTRAS_VERTICAIS" : padraoInicial
  );
  const [corSigla, setCorSigla] = useState(corSiglaInicial);

  const padraoFinal = numeroCores === 1 ? "SOLIDO" : padrao;
  const coresAtivas = cores.slice(0, numeroCores);

  function setCor(i: number, valor: string) {
    setCores((prev) => prev.map((c, idx) => (idx === i ? valor : c)));
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="padraoUniforme" value={padraoFinal} />

      <Input
        name="sigla"
        type="text"
        label={siglaLabel}
        placeholder={siglaPlaceholder}
        maxLength={4}
        required
        value={sigla}
        onChange={(e) => setSigla(e.target.value.toUpperCase())}
        className="uppercase"
      />

      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Uniforme</span>
          <div className="inline-flex rounded-lg border border-slate-200 p-1 dark:border-slate-800">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNumeroCores(n)}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                  numeroCores === n
                    ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {n} cor{n > 1 ? "es" : ""}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {coresAtivas.map((cor, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              Cor {i + 1}
              <input
                type="color"
                name="cores"
                value={cor}
                onChange={(e) => setCor(i, e.target.value)}
                className="h-8 w-10 cursor-pointer rounded border border-slate-300 dark:border-slate-700"
              />
            </label>
          ))}

          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            Cor da sigla
            <input
              type="color"
              name="corSigla"
              value={corSigla}
              onChange={(e) => setCorSigla(e.target.value)}
              className="h-8 w-10 cursor-pointer rounded border border-slate-300 dark:border-slate-700"
            />
          </label>

          <Jersey cores={coresAtivas} padraoUniforme={padraoFinal} sigla={sigla || "?"} corSigla={corSigla} size={56} />
        </div>

        {numeroCores >= 2 && (
          <div className="flex flex-wrap gap-2">
            {PADROES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPadrao(p.value)}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition ${
                  padrao === p.value
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-400"
                    : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-400"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

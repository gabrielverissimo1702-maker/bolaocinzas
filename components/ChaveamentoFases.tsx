"use client";

import { useState } from "react";
import Link from "next/link";
import { UsuarioUniforme, type UsuarioUniformeInfo } from "@/components/UsuarioUniforme";
import { IconChevronLeft, IconChevronRight } from "@/components/ui/icons";

export interface ConfrontoView {
  id: string;
  participanteA: UsuarioUniformeInfo | null;
  participanteB: UsuarioUniformeInfo | null;
  pontosA: number | null;
  pontosB: number | null;
  aVenceu: boolean;
  bVenceu: boolean;
  souEuNoConfronto: boolean;
  emAndamento: boolean;
  decidido: boolean;
  temConfrontoReal: boolean;
}

export interface EtapaView {
  id: string;
  nome: string;
  confrontos: ConfrontoView[];
}

function ConfrontoCard({
  confronto,
  competicaoId,
  visualizacaoHref,
}: {
  confronto: ConfrontoView;
  competicaoId: string;
  visualizacaoHref: string;
}) {
  const c = confronto;
  const palpitesHref = `/usuario/competicoes/${competicaoId}/confrontos/${c.id}/palpites`;
  const mostrarPalpitar = c.emAndamento && c.souEuNoConfronto;

  return (
    <div
      className={`rounded-lg border p-2 text-sm ${
        c.souEuNoConfronto
          ? "border-emerald-400 bg-emerald-50/50 dark:border-emerald-600 dark:bg-emerald-950/20"
          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950"
      }`}
    >
      <div
        className={`flex min-w-0 items-center justify-between gap-2 rounded px-2 py-1 ${
          c.aVenceu ? "font-bold text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"
        }`}
      >
        {c.participanteA ? (
          <UsuarioUniforme usuario={c.participanteA} size={24} className="min-w-0 text-inherit" />
        ) : (
          <span className="truncate">-</span>
        )}
        {c.pontosA != null && <span className="shrink-0 text-sm font-extrabold">{c.pontosA}</span>}
      </div>
      <div className="my-0.5 border-t border-slate-100 dark:border-slate-800" />
      <div
        className={`flex min-w-0 items-center justify-between gap-2 rounded px-2 py-1 ${
          c.bVenceu ? "font-bold text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"
        }`}
      >
        {c.participanteB ? (
          <UsuarioUniforme usuario={c.participanteB} size={24} className="min-w-0 text-inherit" />
        ) : (
          <span className="truncate">-</span>
        )}
        {c.pontosB != null && <span className="shrink-0 text-sm font-extrabold">{c.pontosB}</span>}
      </div>

      {(mostrarPalpitar || c.temConfrontoReal) && (
        <div className="mt-2 flex gap-1.5">
          {mostrarPalpitar && (
            <Link
              href={palpitesHref}
              className="flex-1 rounded-md bg-emerald-600 px-2 py-1 text-center text-xs font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950"
            >
              Palpitar
            </Link>
          )}
          {c.temConfrontoReal && (
            <Link
              href={visualizacaoHref}
              className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-center text-xs font-semibold text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600"
            >
              Ver palpites
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export function ChaveamentoFases({
  etapas,
  competicaoId,
  visualizacaoBaseHref,
}: {
  etapas: EtapaView[];
  competicaoId: string;
  visualizacaoBaseHref: string;
}) {
  const indiceInicial = (() => {
    const emAberto = etapas.findIndex((e) => e.confrontos.some((c) => !c.decidido));
    return emAberto === -1 ? etapas.length - 1 : emAberto;
  })();
  const [indice, setIndice] = useState(indiceInicial);
  const etapaAtual = etapas[indice];

  return (
    <>
      <div className="flex min-w-0 flex-col gap-4 md:hidden">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIndice((i) => Math.max(0, i - 1))}
            disabled={indice === 0}
            aria-label="Fase anterior"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 dark:border-slate-800 dark:text-slate-400"
          >
            <IconChevronLeft className="h-4 w-4" />
          </button>
          <p className="min-w-0 flex-1 truncate text-center text-sm font-bold tracking-wide text-slate-700 uppercase dark:text-slate-200">
            {etapaAtual.nome}
          </p>
          <button
            type="button"
            onClick={() => setIndice((i) => Math.min(etapas.length - 1, i + 1))}
            disabled={indice === etapas.length - 1}
            aria-label="Próxima fase"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 disabled:opacity-30 dark:border-slate-800 dark:text-slate-400"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {etapaAtual.confrontos.map((c) => (
            <ConfrontoCard
              key={c.id}
              confronto={c}
              competicaoId={competicaoId}
              visualizacaoHref={`${visualizacaoBaseHref}&etapaId=${etapaAtual.id}`}
            />
          ))}
        </div>
      </div>

      <div className="hidden gap-6 overflow-x-auto pb-4 md:flex">
        {etapas.map((etapa) => (
          <div key={etapa.id} className="flex w-56 shrink-0 flex-col gap-4">
            <p className="text-center text-sm font-semibold text-slate-500 dark:text-slate-400">{etapa.nome}</p>
            <div className="flex flex-1 flex-col justify-around gap-4">
              {etapa.confrontos.map((c) => (
                <ConfrontoCard
                  key={c.id}
                  confronto={c}
                  competicaoId={competicaoId}
                  visualizacaoHref={`${visualizacaoBaseHref}&etapaId=${etapa.id}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

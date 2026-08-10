"use client";

import { useState, useTransition } from "react";
import { atribuirParticipanteSlot } from "@/app/actions/copa";
import { UsuarioUniforme, type UsuarioUniformeInfo } from "@/components/UsuarioUniforme";
import { Badge } from "@/components/ui/Badge";
import { IconPlus, IconX } from "@/components/ui/icons";
import { FecharEtapaButton } from "./FecharEtapaButton";

export type ParticipanteAdmin = UsuarioUniformeInfo & { copaParticipanteId: string };

export interface ConfrontoAdminView {
  id: string;
  participanteA: ParticipanteAdmin | null;
  participanteB: ParticipanteAdmin | null;
  pontosA: number | null;
  pontosB: number | null;
  aVenceu: boolean;
  bVenceu: boolean;
}

export interface EtapaAdminView {
  id: string;
  nome: string;
  status: "ABERTA" | "FECHADA";
  confrontos: ConfrontoAdminView[];
}

function SlotRow({
  participante,
  pontos,
  venceu,
  candidatos,
  onAtribuir,
  pending,
}: {
  participante: ParticipanteAdmin | null;
  pontos: number | null;
  venceu: boolean;
  candidatos: ParticipanteAdmin[];
  onAtribuir: (copaParticipanteId: string | null) => void;
  pending: boolean;
}) {
  const [editando, setEditando] = useState(false);

  if (participante) {
    return (
      <div
        className={`flex min-w-0 items-center justify-between gap-2 rounded px-2 py-1 ${
          venceu ? "font-bold text-emerald-700 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"
        }`}
      >
        <UsuarioUniforme usuario={participante} size={22} className="min-w-0 text-inherit" />
        <div className="flex shrink-0 items-center gap-2">
          {pontos != null && <span className="text-sm font-extrabold">{pontos}</span>}
          <button
            type="button"
            onClick={() => onAtribuir(null)}
            disabled={pending}
            aria-label="Remover participante"
            className="text-slate-400 hover:text-red-500 disabled:opacity-40"
          >
            <IconX className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  if (editando) {
    return (
      <div className="flex items-center gap-1 px-1 py-0.5">
        <select
          autoFocus
          defaultValue=""
          disabled={pending}
          onChange={(e) => {
            if (e.target.value) {
              onAtribuir(e.target.value);
              setEditando(false);
            }
          }}
          className="min-w-0 flex-1 rounded border border-slate-300 bg-white px-1.5 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50"
        >
          <option value="" disabled>
            Selecionar...
          </option>
          {candidatos.map((c) => (
            <option key={c.copaParticipanteId} value={c.copaParticipanteId}>
              {c.nome}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setEditando(false)}
          className="shrink-0 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditando(true)}
      disabled={pending || candidatos.length === 0}
      className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-xs font-semibold text-slate-400 hover:text-emerald-600 disabled:opacity-40 dark:text-slate-500 dark:hover:text-emerald-400"
    >
      <IconPlus className="h-3.5 w-3.5" />
      Adicionar
    </button>
  );
}

export function ChaveamentoAdmin({
  etapas,
  candidatos,
  saveId,
}: {
  etapas: EtapaAdminView[];
  candidatos: ParticipanteAdmin[];
  saveId: string;
}) {
  const [pending, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function atribuir(confrontoId: string, slot: "A" | "B", copaParticipanteId: string | null) {
    setErro(null);
    startTransition(async () => {
      const resultado = await atribuirParticipanteSlot(saveId, confrontoId, slot, copaParticipanteId);
      if (resultado?.error) setErro(resultado.error);
    });
  }

  return (
    <div>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {etapas.map((etapa) => (
          <div key={etapa.id} className="flex w-64 shrink-0 flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{etapa.nome}</p>
              {etapa.status === "FECHADA" ? (
                <Badge tone="neutral">Fechada</Badge>
              ) : etapa.confrontos.length > 0 ? (
                <FecharEtapaButton saveId={saveId} etapaId={etapa.id} />
              ) : null}
            </div>

            <div className="flex flex-1 flex-col justify-around gap-4">
              {etapa.confrontos.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg border border-slate-200 bg-white p-2 text-sm dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950"
                >
                  <SlotRow
                    participante={c.participanteA}
                    pontos={c.pontosA}
                    venceu={c.aVenceu}
                    candidatos={candidatos}
                    onAtribuir={(id) => atribuir(c.id, "A", id)}
                    pending={pending}
                  />
                  <div className="my-0.5 border-t border-slate-100 dark:border-slate-800" />
                  <SlotRow
                    participante={c.participanteB}
                    pontos={c.pontosB}
                    venceu={c.bVenceu}
                    candidatos={candidatos}
                    onAtribuir={(id) => atribuir(c.id, "B", id)}
                    pending={pending}
                  />
                </div>
              ))}
              {etapa.confrontos.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-500">Nenhum confronto.</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {erro && <p className="text-sm text-red-600 dark:text-red-400">{erro}</p>}
    </div>
  );
}

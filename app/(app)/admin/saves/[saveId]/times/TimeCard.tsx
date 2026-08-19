"use client";

import { useActionState, useState } from "react";
import { atualizarTime, removerTime, type TimesActionState } from "@/app/actions/times";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Jersey } from "@/components/ui/Jersey";
import { UniformePicker } from "@/components/UniformePicker";

const initialState: TimesActionState = {};

export interface TimeCardData {
  id: string;
  nome: string;
  sigla: string;
  cores: string[];
  padraoUniforme: "SOLIDO" | "LISTRAS_VERTICAIS" | "LISTRAS_HORIZONTAIS" | "LISTRAS_DIAGONAIS" | "MANGAS_CONTRASTANTES" | "GOLA_CONTRASTANTE" | "BICOLOR" | "DEGRADE";
  corSigla: string;
}

export function TimeCard({ time, saveId }: { time: TimeCardData; saveId: string }) {
  const [editando, setEditando] = useState(false);
  const [state, formAction, pending] = useActionState(async (prevState: TimesActionState, formData: FormData) => {
    const resultado = await atualizarTime(prevState, formData);
    if (resultado.success) setEditando(false);
    return resultado;
  }, initialState);

  if (!editando) {
    return (
      <Card className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <Jersey
            cores={time.cores}
            padraoUniforme={time.padraoUniforme}
            sigla={time.sigla}
            corSigla={time.corSigla}
            size={40}
          />
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-50">{time.nome}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{time.sigla}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
          >
            Editar
          </button>
          <form action={removerTime.bind(null, time.id, saveId)}>
            <button
              type="submit"
              className="text-sm font-medium text-red-600 hover:underline dark:text-red-400"
            >
              Remover
            </button>
          </form>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="timeId" value={time.id} />
        <input type="hidden" name="saveId" value={saveId} />

        <Input name="nome" type="text" label="Nome do time" defaultValue={time.nome} required />

        <UniformePicker
          siglaInicial={time.sigla}
          coresIniciais={time.cores}
          padraoInicial={time.padraoUniforme}
          corSiglaInicial={time.corSigla}
        />

        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
          <button
            type="button"
            onClick={() => setEditando(false)}
            className="text-sm font-medium text-slate-600 hover:underline dark:text-slate-400"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Card>
  );
}

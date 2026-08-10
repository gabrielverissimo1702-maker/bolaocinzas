"use client";

import { useActionState } from "react";
import { criarTemporada, type TemporadasActionState } from "@/app/actions/temporadas";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: TemporadasActionState = {};

export function NovaTemporadaForm({ saveId }: { saveId: string }) {
  const [state, formAction, pending] = useActionState(criarTemporada, initialState);

  return (
    <form action={formAction} className="flex items-end gap-3">
      <input type="hidden" name="saveId" value={saveId} />
      <div className="flex-1">
        <Input name="nome" type="text" label="Nome da temporada" placeholder="ex: 2026" required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Criando..." : "Criar temporada"}
      </Button>
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

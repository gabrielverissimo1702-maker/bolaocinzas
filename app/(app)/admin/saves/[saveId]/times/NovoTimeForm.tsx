"use client";

import { useActionState } from "react";
import { criarTime, type TimesActionState } from "@/app/actions/times";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UniformePicker } from "@/components/UniformePicker";

const initialState: TimesActionState = {};

export function NovoTimeForm({ saveId }: { saveId: string }) {
  const [state, formAction, pending] = useActionState(criarTime, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="saveId" value={saveId} />

      <Input name="nome" type="text" label="Nome do time" placeholder="ex: Flamengo" required />

      <UniformePicker siglaPlaceholder="ex: FLA" />

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Criando..." : "Adicionar time"}
      </Button>
    </form>
  );
}

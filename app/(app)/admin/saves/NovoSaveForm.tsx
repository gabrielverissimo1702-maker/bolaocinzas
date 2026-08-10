"use client";

import { useActionState } from "react";
import { criarSave, type SavesActionState } from "@/app/actions/saves";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: SavesActionState = {};

export function NovoSaveForm() {
  const [state, formAction, pending] = useActionState(criarSave, initialState);

  return (
    <form action={formAction} className="flex items-end gap-3">
      <div className="flex-1">
        <Input name="nome" type="text" label="Nome do save" placeholder="ex: Amigos do Trabalho" required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Criando..." : "Criar save"}
      </Button>
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

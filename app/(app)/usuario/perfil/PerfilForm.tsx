"use client";

import { useActionState } from "react";
import { atualizarPerfil, type PerfilActionState } from "@/app/actions/perfil";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UniformePicker } from "@/components/UniformePicker";

const initialState: PerfilActionState = {};

export function PerfilForm({
  nome,
  sigla,
  cores,
  padraoUniforme,
}: {
  nome: string;
  sigla: string;
  cores: string[];
  padraoUniforme: "SOLIDO" | "LISTRAS_VERTICAIS" | "LISTRAS_HORIZONTAIS" | "LISTRAS_DIAGONAIS" | "MANGAS_CONTRASTANTES" | "GOLA_CONTRASTANTE" | "BICOLOR" | "DEGRADE";
}) {
  const [state, formAction, pending] = useActionState(atualizarPerfil, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input name="nome" type="text" label="Nome" defaultValue={nome} required maxLength={80} />

      <UniformePicker
        siglaInicial={sigla}
        coresIniciais={cores}
        padraoInicial={padraoUniforme}
        siglaLabel="Sua sigla"
      />

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">Perfil atualizado!</p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}

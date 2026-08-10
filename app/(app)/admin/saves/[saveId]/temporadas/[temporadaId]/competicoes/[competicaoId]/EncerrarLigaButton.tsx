"use client";

import { useState, useTransition } from "react";
import { encerrarLiga } from "@/app/actions/competicoes";
import { Button } from "@/components/ui/Button";

export function EncerrarLigaButton({ saveId, competicaoId }: { saveId: string; competicaoId: string }) {
  const [pending, startTransition] = useTransition();
  const [mensagem, setMensagem] = useState<string | null>(null);

  function handleClick() {
    startTransition(async () => {
      const resultado = await encerrarLiga(saveId, competicaoId);
      setMensagem(resultado.error ?? `Campeão: ${resultado.campeaoNome}`);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="outline" size="sm" onClick={handleClick} disabled={pending}>
        {pending ? "Processando..." : "Encerrar Liga"}
      </Button>
      {mensagem && <p className="text-xs text-slate-500 dark:text-slate-400">{mensagem}</p>}
    </div>
  );
}

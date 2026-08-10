"use client";

import { useState, useTransition } from "react";
import { fecharEtapaCopa } from "@/app/actions/copa";
import { Button } from "@/components/ui/Button";

export function FecharEtapaButton({ saveId, etapaId }: { saveId: string; etapaId: string }) {
  const [pending, startTransition] = useTransition();
  const [mensagem, setMensagem] = useState<string | null>(null);

  function handleClick() {
    startTransition(async () => {
      const resultado = await fecharEtapaCopa(saveId, etapaId);
      if (resultado.erro) {
        setMensagem(resultado.erro);
      } else if (resultado.pendentes > 0) {
        setMensagem(
          `${resultado.resolvidos} confronto(s) decidido(s). ${resultado.pendentes} aguardando jogo extra de desempate.`
        );
      } else {
        setMensagem(`${resultado.resolvidos} confronto(s) decidido(s). Etapa fechada.`);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="outline" size="sm" onClick={handleClick} disabled={pending}>
        {pending ? "Processando..." : "Fechar etapa"}
      </Button>
      {mensagem && <p className="text-xs text-slate-500 dark:text-slate-400">{mensagem}</p>}
    </div>
  );
}

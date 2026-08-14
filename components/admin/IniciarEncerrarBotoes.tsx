"use client";

import { useState, useTransition } from "react";
import {
  iniciarCompeticao,
  encerrarLiga,
  encerrarCopaSupercopa,
} from "@/app/actions/competicoes";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function IniciarEncerrarBotoes({
  saveId,
  competicaoId,
  tipo,
  status,
}: {
  saveId: string;
  competicaoId: string;
  tipo: "LIGA" | "COPA" | "SUPERCOPA";
  status: "RASCUNHO" | "EM_ANDAMENTO" | "ENCERRADA";
}) {
  const [pending, startTransition] = useTransition();
  const [mensagem, setMensagem] = useState<string | null>(null);

  function iniciar() {
    setMensagem(null);
    startTransition(async () => {
      const resultado = await iniciarCompeticao(saveId, competicaoId);
      if (resultado.error) setMensagem(resultado.error);
    });
  }

  function encerrar() {
    setMensagem(null);
    startTransition(async () => {
      const resultado =
        tipo === "LIGA"
          ? await encerrarLiga(saveId, competicaoId)
          : await encerrarCopaSupercopa(saveId, competicaoId);
      setMensagem(resultado.error ?? ("campeaoNome" in resultado && resultado.campeaoNome ? `Campeão: ${resultado.campeaoNome}` : "Encerrada"));
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        {status === "RASCUNHO" && (
          <Button type="button" size="sm" onClick={iniciar} disabled={pending}>
            {pending ? "Processando..." : "Iniciar"}
          </Button>
        )}
        {status === "EM_ANDAMENTO" && (
          <Button type="button" variant="outline" size="sm" onClick={encerrar} disabled={pending}>
            {pending ? "Processando..." : "Encerrar"}
          </Button>
        )}
        {status === "ENCERRADA" && <Badge tone="neutral">Encerrada</Badge>}
      </div>
      {mensagem && <p className="text-xs text-slate-500 dark:text-slate-400">{mensagem}</p>}
    </div>
  );
}

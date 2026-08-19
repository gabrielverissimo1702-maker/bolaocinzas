"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export function ZonaPerigo({
  titulo,
  descricao,
  nomeConfirmacao,
  action,
}: {
  titulo: string;
  descricao: string;
  nomeConfirmacao: string;
  action: () => Promise<void>;
}) {
  const [aberto, setAberto] = useState(false);
  const [valor, setValor] = useState("");
  const confirmado = valor.trim() === nomeConfirmacao;

  return (
    <Card className="mt-8 border-red-200 dark:border-red-900/50">
      <p className="text-xs font-bold tracking-widest text-red-600 uppercase dark:text-red-400">Zona de perigo</p>
      <p className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{titulo}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{descricao}</p>

      {!aberto ? (
        <Button variant="danger" className="mt-4" onClick={() => setAberto(true)}>
          {titulo}
        </Button>
      ) : (
        <form action={action} className="mt-4 flex flex-col gap-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Digite <span className="font-semibold text-slate-900 dark:text-slate-50">{nomeConfirmacao}</span> pra
            confirmar.
          </p>
          <Input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder={nomeConfirmacao}
            autoComplete="off"
          />
          <div className="flex items-center gap-3">
            <Button type="submit" variant="danger" disabled={!confirmado}>
              Confirmar exclusão
            </Button>
            <button
              type="button"
              onClick={() => {
                setAberto(false);
                setValor("");
              }}
              className="text-sm font-medium text-slate-600 hover:underline dark:text-slate-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </Card>
  );
}

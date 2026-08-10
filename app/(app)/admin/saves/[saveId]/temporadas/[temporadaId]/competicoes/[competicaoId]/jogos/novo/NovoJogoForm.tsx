"use client";

import { useActionState } from "react";
import { criarJogo, type JogosActionState } from "@/app/actions/jogos";
import { Select, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: JogosActionState = {};

export function NovoJogoForm({
  saveId,
  temporadaId,
  competicaoId,
  etapas,
  times,
}: {
  saveId: string;
  temporadaId: string;
  competicaoId: string;
  etapas: { id: string; nome: string }[];
  times: { id: string; nome: string }[];
}) {
  const [state, formAction, pending] = useActionState(criarJogo, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="saveId" value={saveId} />
      <input type="hidden" name="temporadaId" value={temporadaId} />
      <input type="hidden" name="competicaoId" value={competicaoId} />

      <Select name="etapaId" required label="Etapa">
        {etapas.map((e) => (
          <option key={e.id} value={e.id}>
            {e.nome}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-4">
        <Select name="timeCasaId" required label="Time da casa">
          {times.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </Select>
        <Select name="timeVisitanteId" required label="Time visitante">
          {times.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </Select>
      </div>

      <Input name="dataHora" type="datetime-local" required label="Data e hora" />

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Cadastrando..." : "Cadastrar jogo"}
      </Button>
    </form>
  );
}

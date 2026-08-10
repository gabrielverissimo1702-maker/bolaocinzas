"use client";

import { useActionState, useState } from "react";
import { criarCompeticao, type CompeticoesActionState } from "@/app/actions/competicoes";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: CompeticoesActionState = {};

export function NovaCompeticaoForm({ saveId, temporadaId }: { saveId: string; temporadaId: string }) {
  const [state, formAction, pending] = useActionState(criarCompeticao, initialState);
  const [tipo, setTipo] = useState<"LIGA" | "COPA" | "SUPERCOPA">("LIGA");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="saveId" value={saveId} />
      <input type="hidden" name="temporadaId" value={temporadaId} />
      <input type="hidden" name="tipo" value={tipo} />

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de competição</span>
        <div className="inline-flex w-fit rounded-lg border border-slate-200 p-1 dark:border-slate-800">
          {(["LIGA", "COPA", "SUPERCOPA"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition ${
                tipo === t
                  ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {t === "LIGA" ? "Liga" : t === "COPA" ? "Copa" : "Supercopa"}
            </button>
          ))}
        </div>
      </div>

      <Input name="nome" type="text" label="Nome da competição" required />

      <div className="grid grid-cols-2 gap-4">
        <Input name="pontosCravada" type="number" min={0} defaultValue={10} required label="Pontos por cravada" />
        <Input name="pontosAcerto" type="number" min={0} defaultValue={5} required label="Pontos por acerto parcial" />
      </div>

      {tipo === "LIGA" && (
        <div className="grid grid-cols-2 gap-4">
          <Input name="numeroRodadas" type="number" min={1} defaultValue={10} required label="Número de rodadas" />
          <Input name="jogosPorRodada" type="number" min={1} defaultValue={5} required label="Jogos por rodada" />
        </div>
      )}

      {tipo === "COPA" && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="numeroParticipantes"
              type="number"
              min={2}
              defaultValue={16}
              required
              label="Número de participantes"
            />
            <Input
              name="jogosPorFase"
              type="number"
              min={1}
              defaultValue={2}
              required
              label="Jogos a palpitar por fase"
              hint="Jogos reais que valem pontos em cada fase — não é o confronto entre os dois usuários."
            />
          </div>
          <Select name="criterioDesempate" required label="Critério de desempate" defaultValue="JOGO_EXTRA">
            <option value="JOGO_EXTRA">Jogo extra</option>
            <option value="MAIS_CRAVADAS">Mais placares cravados no confronto</option>
            <option value="MAIS_ACERTOS">Mais acertos (cravada + parcial) no confronto</option>
            <option value="SORTEIO_DIRETO">Sorteio direto</option>
          </Select>
          <Select
            name="formaGeracaoConfrontos"
            required
            label="Forma de gerar confrontos"
            defaultValue="SORTEIO"
          >
            <option value="SORTEIO">Sorteio automático</option>
            <option value="MANUAL">Manual pelo admin</option>
            <option value="HIBRIDO">Híbrido</option>
          </Select>
        </>
      )}

      {tipo === "SUPERCOPA" && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="numeroParticipantes"
              type="number"
              min={2}
              max={4}
              defaultValue={2}
              required
              label="Número de participantes (2 a 4)"
            />
            <Input
              name="numeroJogos"
              type="number"
              min={1}
              defaultValue={1}
              required
              label="Jogos a palpitar por fase"
              hint="Jogos reais que valem pontos — não é o confronto entre os dois usuários."
            />
          </div>
          <Select name="criterioDesempate" required label="Critério de desempate" defaultValue="JOGO_EXTRA">
            <option value="JOGO_EXTRA">Jogo extra</option>
            <option value="MAIS_CRAVADAS">Mais placares cravados</option>
            <option value="MAIS_ACERTOS">Mais acertos (cravada + parcial)</option>
            <option value="SORTEIO_DIRETO">Sorteio direto</option>
          </Select>
          <Select name="formaGeracaoConfrontos" required label="Forma de gerar confrontos" defaultValue="MANUAL">
            <option value="SORTEIO">Sorteio automático</option>
            <option value="MANUAL">Manual pelo admin</option>
            <option value="HIBRIDO">Híbrido</option>
          </Select>
        </>
      )}

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Criando..." : "Criar competição"}
      </Button>
    </form>
  );
}

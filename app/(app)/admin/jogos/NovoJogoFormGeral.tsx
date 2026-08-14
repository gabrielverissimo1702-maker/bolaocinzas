"use client";

import { useActionState, useMemo, useState } from "react";
import { criarJogo, type JogosActionState } from "@/app/actions/jogos";
import { Select, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface EtapaOpcao {
  id: string;
  nome: string;
}
interface CompeticaoOpcao {
  id: string;
  nome: string;
  tipo: string;
  etapas: EtapaOpcao[];
}
interface TemporadaOpcao {
  id: string;
  nome: string;
  competicoes: CompeticaoOpcao[];
}
interface TimeOpcao {
  id: string;
  nome: string;
}
export interface SaveOpcaoJogo {
  id: string;
  nome: string;
  temporadas: TemporadaOpcao[];
  times: TimeOpcao[];
}

const initialState: JogosActionState = {};
const TIPO_LABEL: Record<string, string> = { LIGA: "Liga", COPA: "Copa", SUPERCOPA: "Supercopa" };

export function NovoJogoFormGeral({ saves }: { saves: SaveOpcaoJogo[] }) {
  const [state, formAction, pending] = useActionState(criarJogo, initialState);

  const [saveId, setSaveId] = useState("");
  const [temporadaId, setTemporadaId] = useState("");
  const [competicaoId, setCompeticaoId] = useState("");
  const [etapaId, setEtapaId] = useState("");

  const save = useMemo(() => saves.find((s) => s.id === saveId), [saves, saveId]);
  const temporadas = useMemo(() => save?.temporadas ?? [], [save]);
  const temporada = useMemo(() => temporadas.find((t) => t.id === temporadaId), [temporadas, temporadaId]);
  const competicoes = useMemo(() => temporada?.competicoes ?? [], [temporada]);
  const competicao = useMemo(() => competicoes.find((c) => c.id === competicaoId), [competicoes, competicaoId]);
  const etapas = competicao?.etapas ?? [];
  const times = save?.times ?? [];

  if (saves.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Crie um save com times e uma competição antes de cadastrar jogos.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Select
        name="saveId"
        required
        label="Save"
        value={saveId}
        onChange={(e) => {
          setSaveId(e.target.value);
          setTemporadaId("");
          setCompeticaoId("");
          setEtapaId("");
        }}
      >
        <option value="" disabled>
          Selecionar...
        </option>
        {saves.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nome}
          </option>
        ))}
      </Select>

      <Select
        name="temporadaId"
        required
        label="Temporada"
        value={temporadaId}
        disabled={!save}
        onChange={(e) => {
          setTemporadaId(e.target.value);
          setCompeticaoId("");
          setEtapaId("");
        }}
      >
        <option value="" disabled>
          Selecionar...
        </option>
        {temporadas.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nome}
          </option>
        ))}
      </Select>

      <Select
        name="competicaoId"
        required
        label="Competição"
        value={competicaoId}
        disabled={!temporada}
        onChange={(e) => {
          setCompeticaoId(e.target.value);
          setEtapaId("");
        }}
      >
        <option value="" disabled>
          Selecionar...
        </option>
        {competicoes.map((c) => (
          <option key={c.id} value={c.id}>
            {TIPO_LABEL[c.tipo]} · {c.nome}
          </option>
        ))}
      </Select>

      <Select
        name="etapaId"
        required
        label="Rodada/Fase"
        value={etapaId}
        disabled={!competicao}
        onChange={(e) => setEtapaId(e.target.value)}
      >
        <option value="" disabled>
          Selecionar...
        </option>
        {etapas.map((e) => (
          <option key={e.id} value={e.id}>
            {e.nome}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-4">
        <Select name="timeCasaId" required label="Time da casa" disabled={!save}>
          <option value="" disabled>
            Selecionar...
          </option>
          {times.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </Select>
        <Select name="timeVisitanteId" required label="Time visitante" disabled={!save}>
          <option value="" disabled>
            Selecionar...
          </option>
          {times.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </Select>
      </div>

      <Input name="dataHora" type="datetime-local" required label="Data e hora" />

      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">Jogo cadastrado! Pode cadastrar outro.</p>
      )}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Cadastrando..." : "Cadastrar jogo"}
      </Button>
    </form>
  );
}

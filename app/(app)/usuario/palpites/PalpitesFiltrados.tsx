"use client";

import { useActionState, useMemo, useState } from "react";
import { Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { JogoResumo } from "@/components/JogoResumo";
import { salvarPalpitesLote, type PalpitesActionState } from "@/app/actions/palpites";
import type { JogoParaPalpitarResumo } from "@/lib/dashboard/jogosParaPalpitar";

const TIPO_LABEL: Record<string, string> = { LIGA: "Liga", COPA: "Copa", SUPERCOPA: "Supercopa" };
const initialState: PalpitesActionState = {};

function opcoesUnicas<T extends { id: string; nome: string }>(itens: T[]): T[] {
  const mapa = new Map<string, T>();
  for (const item of itens) mapa.set(item.id, item);
  return [...mapa.values()];
}

function estaTravado(jogo: JogoParaPalpitarResumo): boolean {
  return jogo.placarCasa != null || new Date(jogo.dataHora).getTime() <= Date.now();
}

export function PalpitesFiltrados({ jogos }: { jogos: JogoParaPalpitarResumo[] }) {
  const [state, formAction, pending] = useActionState(salvarPalpitesLote, initialState);

  const [saveId, setSaveId] = useState("");
  const [temporadaId, setTemporadaId] = useState("");
  const [tipo, setTipo] = useState("");
  const [etapaId, setEtapaId] = useState("");

  const saves = useMemo(
    () => opcoesUnicas(jogos.map((j) => ({ id: j.saveId, nome: j.saveNome }))),
    [jogos]
  );

  const jogosDoSave = useMemo(
    () => (saveId ? jogos.filter((j) => j.saveId === saveId) : jogos),
    [jogos, saveId]
  );
  const temporadas = useMemo(
    () => opcoesUnicas(jogosDoSave.map((j) => ({ id: j.temporadaId, nome: j.temporadaNome }))),
    [jogosDoSave]
  );

  const jogosDaTemporada = useMemo(
    () => (temporadaId ? jogosDoSave.filter((j) => j.temporadaId === temporadaId) : jogosDoSave),
    [jogosDoSave, temporadaId]
  );
  const tipos = useMemo(
    () => [...new Set(jogosDaTemporada.map((j) => j.competicaoTipo))],
    [jogosDaTemporada]
  );

  const jogosDoTipo = useMemo(
    () => (tipo ? jogosDaTemporada.filter((j) => j.competicaoTipo === tipo) : jogosDaTemporada),
    [jogosDaTemporada, tipo]
  );
  const fases = useMemo(
    () => opcoesUnicas(jogosDoTipo.map((j) => ({ id: j.etapaId, nome: j.etapaNome }))),
    [jogosDoTipo]
  );

  const jogosFiltrados = useMemo(
    () => (etapaId ? jogosDoTipo.filter((j) => j.etapaId === etapaId) : jogosDoTipo),
    [jogosDoTipo, etapaId]
  );

  const temJogoEditavel = jogosFiltrados.some((j) => !estaTravado(j));

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Select
          label="Save"
          value={saveId}
          onChange={(e) => {
            setSaveId(e.target.value);
            setTemporadaId("");
            setTipo("");
            setEtapaId("");
          }}
        >
          <option value="">Todos</option>
          {saves.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </Select>

        <Select
          label="Temporada"
          value={temporadaId}
          onChange={(e) => {
            setTemporadaId(e.target.value);
            setTipo("");
            setEtapaId("");
          }}
        >
          <option value="">Todas</option>
          {temporadas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </Select>

        <Select
          label="Competição"
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value);
            setEtapaId("");
          }}
        >
          <option value="">Todas</option>
          {tipos.map((t) => (
            <option key={t} value={t}>
              {TIPO_LABEL[t]}
            </option>
          ))}
        </Select>

        <Select label="Fase/Rodada" value={etapaId} onChange={(e) => setEtapaId(e.target.value)}>
          <option value="">Todas</option>
          {fases.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nome}
            </option>
          ))}
        </Select>
      </div>

      {jogosFiltrados.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum jogo encontrado com esses filtros.</p>
      ) : (
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            {jogosFiltrados.map((j) => (
              <JogoResumo
                key={j.id}
                jogo={j}
                cabecalho={`${TIPO_LABEL[j.competicaoTipo]} · ${j.competicaoNome} · ${j.etapaNome}`}
                editavel
                travado={estaTravado(j)}
                meuPalpite={j.meuPalpite}
              />
            ))}
          </div>

          {temJogoEditavel && (
            <>
              {state.error && <p className="text-center text-sm text-red-600 dark:text-red-400">{state.error}</p>}
              {state.success && (
                <p className="text-center text-sm text-emerald-600 dark:text-emerald-400">
                  Palpites salvos! Um comprovante será enviado para o seu email.
                </p>
              )}
              <Button type="submit" disabled={pending} className="self-center">
                {pending ? "Salvando..." : "Salvar Palpites"}
              </Button>
            </>
          )}
        </form>
      )}
    </div>
  );
}

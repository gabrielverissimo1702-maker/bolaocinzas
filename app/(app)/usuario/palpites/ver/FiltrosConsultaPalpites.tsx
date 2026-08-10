"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { PalpitesFiltroOpcao } from "@/lib/dashboard/palpitesHub";

const TIPO_LABEL: Record<string, string> = { LIGA: "Liga", COPA: "Copa", SUPERCOPA: "Supercopa" };

function unicos<T extends { id: string; nome: string }>(itens: T[]): T[] {
  const mapa = new Map<string, T>();
  for (const item of itens) mapa.set(item.id, item);
  return [...mapa.values()];
}

export function FiltrosConsultaPalpites({
  opcoes,
  valores,
}: {
  opcoes: PalpitesFiltroOpcao[];
  valores: { saveId: string; temporadaId: string; competicaoId: string; etapaId: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filtros, setFiltros] = useState(valores);

  function atualizar(proximos: Partial<typeof valores>) {
    setFiltros((atual) => ({ ...atual, ...proximos }));
  }

  function aplicar() {
    const params = new URLSearchParams(searchParams.toString());
    for (const [chave, valor] of Object.entries(filtros)) {
      if (valor) params.set(chave, valor);
      else params.delete(chave);
    }
    router.push(`/usuario/palpites/ver?${params.toString()}`);
  }

  const saves = useMemo(() => unicos(opcoes.map((o) => ({ id: o.saveId, nome: o.saveNome }))), [opcoes]);
  const porSave = filtros.saveId ? opcoes.filter((o) => o.saveId === filtros.saveId) : opcoes;
  const temporadas = useMemo(() => unicos(porSave.map((o) => ({ id: o.temporadaId, nome: o.temporadaNome }))), [porSave]);
  const porTemporada = filtros.temporadaId ? porSave.filter((o) => o.temporadaId === filtros.temporadaId) : porSave;
  const competicoes = useMemo(
    () => unicos(porTemporada.map((o) => ({ id: o.competicaoId, nome: `${TIPO_LABEL[o.competicaoTipo]} - ${o.competicaoNome}` }))),
    [porTemporada]
  );
  const porCompeticao = filtros.competicaoId ? porTemporada.filter((o) => o.competicaoId === filtros.competicaoId) : porTemporada;
  const etapas = useMemo(() => unicos(porCompeticao.map((o) => ({ id: o.etapaId, nome: o.etapaNome }))), [porCompeticao]);

  return (
    <div className="mb-5 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Select
          label="Save"
          value={filtros.saveId}
          onChange={(e) => atualizar({ saveId: e.target.value, temporadaId: "", competicaoId: "", etapaId: "" })}
        >
          {saves.map((s) => (
            <option key={s.id} value={s.id}>{s.nome}</option>
          ))}
        </Select>
        <Select
          label="Temporada"
          value={filtros.temporadaId}
          onChange={(e) => atualizar({ temporadaId: e.target.value, competicaoId: "", etapaId: "" })}
        >
          {temporadas.map((t) => (
            <option key={t.id} value={t.id}>{t.nome}</option>
          ))}
        </Select>
        <Select
          label="Competição"
          value={filtros.competicaoId}
          onChange={(e) => atualizar({ competicaoId: e.target.value, etapaId: "" })}
        >
          {competicoes.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </Select>
        <Select label="Rodada/Fase" value={filtros.etapaId} onChange={(e) => atualizar({ etapaId: e.target.value })}>
          {etapas.map((e) => (
            <option key={e.id} value={e.id}>{e.nome}</option>
          ))}
        </Select>
      </div>
      <Button type="button" onClick={aplicar} className="mt-3 w-full">
        Filtrar
      </Button>
    </div>
  );
}

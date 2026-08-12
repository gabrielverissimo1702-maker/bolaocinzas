"use client";

import { useActionState, useRef } from "react";
import { salvarPalpitesLote, type PalpitesActionState } from "@/app/actions/palpites";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Jersey } from "@/components/ui/Jersey";
import { UsuarioUniforme } from "@/components/UsuarioUniforme";
import { IconChevronLeft, IconChevronRight } from "@/components/ui/icons";
import { TIMEZONE_BRASIL } from "@/lib/timezone";

const initialState: PalpitesActionState = {};


const RESULTADO_CARD: Record<string, string> = {
  CRAVADA: "border-amber-400 bg-amber-50 text-amber-950 dark:border-amber-500 dark:bg-amber-950/30 dark:text-amber-100",
  ACERTO_PARCIAL: "border-emerald-400 bg-emerald-50 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-100",
  ERRO: "border-red-400 bg-red-50 text-red-950 dark:border-red-500 dark:bg-red-950/30 dark:text-red-100",
};

interface TimeInfo {
  nome: string;
  sigla: string;
  cores: string[];
  padraoUniforme: "SOLIDO" | "LISTRAS_VERTICAIS" | "LISTRAS_HORIZONTAIS" | "LISTRAS_DIAGONAIS";
}

export interface PalpiteRevelado {
  usuarioId: string;
  nome: string;
  sigla: string;
  cores: string[];
  padraoUniforme: "SOLIDO" | "LISTRAS_VERTICAIS" | "LISTRAS_HORIZONTAIS" | "LISTRAS_DIAGONAIS";
  placarCasa: number;
  placarVisitante: number;
  tipoResultado: string | null;
  pontos: number | null;
}

export interface JogoParaPalpitar {
  id: string;
  dataHora: Date | string;
  placarCasa: number | null;
  placarVisitante: number | null;
  timeCasa: TimeInfo;
  timeVisitante: TimeInfo;
  ehJogoExtra?: boolean;
  palpite: { placarCasa: number; placarVisitante: number; tipoResultado: string; pontos: number } | null;
  /** Só populado pelo servidor quando o jogo já travou (ver jogoEstaTravado). */
  palpitesRevelados?: PalpiteRevelado[] | null;
}

function CardPalpiteRevelado({
  p,
  souEu,
  destaque = false,
}: {
  p: PalpiteRevelado;
  souEu: boolean;
  destaque?: boolean;
}) {
  const resultadoClass = p.tipoResultado ? RESULTADO_CARD[p.tipoResultado] : "border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50";

  return (
    <div
      className={`flex shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border-2 px-2.5 py-2 sm:px-3 sm:py-2.5 text-center ${resultadoClass} ${
        destaque ? "w-[112px] sm:w-[132px]" : "w-[112px] sm:w-[128px]"
      }`}
    >
      <UsuarioUniforme
        usuario={{ ...p, nome: souEu ? "Meu palpite" : p.nome }}
        size={18}
        className="max-w-[104px] justify-center text-[11px] sm:max-w-[122px] sm:text-xs text-inherit"
      />
      <span className="text-base font-extrabold tabular-nums sm:text-lg text-inherit">
        {p.placarCasa} x {p.placarVisitante}
      </span>
      <span className="text-xs font-extrabold text-inherit sm:text-sm">
        {p.pontos ?? 0} pts
      </span>
    </div>
  );
}

function PalpitesRevelados({
  palpites,
  meuUsuarioId,
  layout: _layout,
}: {
  palpites: PalpiteRevelado[];
  meuUsuarioId: string;
  layout: "carrossel" | "comparativo";
}) {
  const listaRef = useRef<HTMLDivElement>(null);

  function rolar(direcao: -1 | 1) {
    listaRef.current?.scrollBy({ left: direcao * 140, behavior: "smooth" });
  }

  if (palpites.length === 0) {
    return (
      <p className="text-center text-xs text-slate-400 dark:text-slate-500">Ninguém palpitou este jogo.</p>
    );
  }


  const meuPalpite = palpites.find((p) => p.usuarioId === meuUsuarioId);
  const outrosPalpites = palpites.filter((p) => p.usuarioId !== meuUsuarioId);

  return (
    <div className="flex w-full items-stretch gap-2 sm:gap-3">
      <div className="shrink-0">
        {meuPalpite ? (
          <CardPalpiteRevelado p={meuPalpite} souEu destaque />
        ) : (
          <div className="flex h-full w-[112px] flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 px-2.5 py-2 text-center dark:border-slate-700 dark:bg-slate-900/60 sm:w-[132px] sm:px-3 sm:py-2.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 sm:text-xs">Meu palpite</span>
            <span className="text-base font-extrabold text-slate-400 sm:text-lg">- x -</span>
            <span className="text-xs font-extrabold text-slate-400 sm:text-sm">0 pts</span>
          </div>
        )}
      </div>

      {outrosPalpites.length > 0 ? (
        <div className="grid min-w-0 flex-1 grid-cols-[36px_minmax(0,1fr)_36px] items-center gap-1">
          <button
            type="button"
            onClick={() => rolar(-1)}
            aria-label="Ver palpites anteriores"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
          >
            <IconChevronLeft className="h-4 w-4" />
          </button>
          <div ref={listaRef} className="flex min-w-0 snap-x gap-2 overflow-x-auto pb-1 sm:gap-3">
            {outrosPalpites.map((p) => (
              <div key={p.usuarioId} className="snap-start">
                <CardPalpiteRevelado p={p} souEu={false} />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => rolar(1)}
            aria-label="Ver próximos palpites"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-800 dark:text-slate-400 dark:hover:border-emerald-500 dark:hover:text-emerald-400"
          >
            <IconChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <p className="self-center text-center text-xs text-slate-400 dark:text-slate-500">
          Nenhum outro participante palpitou este jogo.
        </p>
      )}
    </div>
  );
}

export function PalpitesRodadaCard({
  etapaNome,
  jogos,
  meuUsuarioId,
  layoutRevelacao = "carrossel",
  somenteLeitura = false,
}: {
  etapaNome: string;
  jogos: JogoParaPalpitar[];
  meuUsuarioId?: string;
  layoutRevelacao?: "carrossel" | "comparativo";
  somenteLeitura?: boolean;
}) {
  const [state, formAction, pending] = useActionState(salvarPalpitesLote, initialState);

  const agora = Date.now();
  const estaTravado = (jogo: JogoParaPalpitar) =>
    jogo.placarCasa != null || new Date(jogo.dataHora).getTime() <= agora;

  const temJogoEditavel = !somenteLeitura && jogos.some((j) => !estaTravado(j));

  return (
    <Card>
      <p className="mb-4 text-center text-sm font-extrabold tracking-widest text-emerald-600 uppercase dark:text-emerald-400">
        {etapaNome}
      </p>

      <form action={formAction} className="flex flex-col gap-4">
        {jogos.map((jogo) => {
          const resultadoSaiu = jogo.placarCasa != null;
          const travado = estaTravado(jogo);
          const podeEditar = !somenteLeitura && !travado;
          const boxClass = podeEditar
            ? "w-11 rounded-lg border-2 border-emerald-500/50 bg-slate-800/80 py-1.5 text-center text-base font-extrabold text-white outline-none [appearance:textfield] focus:border-emerald-400 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            : "w-11 rounded-lg border-2 border-slate-600/40 bg-slate-800/60 py-1.5 text-center text-base font-extrabold text-slate-300 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

          return (
            <div
              key={jogo.id}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-4 dark:border-slate-800"
            >
              {jogo.ehJogoExtra && <Badge tone="warning">Jogo extra (desempate)</Badge>}

              <div className="flex w-full items-center justify-center gap-2 sm:gap-3">
                <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
                  <span className="truncate text-sm font-bold text-slate-900 dark:text-slate-50">
                    {jogo.timeCasa.sigla}
                  </span>
                  <Jersey {...jogo.timeCasa} size={40} />
                </div>

                <input type="hidden" name="jogoId" value={jogo.id} />

                <div className="flex shrink-0 items-center gap-1.5">
                  {resultadoSaiu ? (
                    <span className={boxClass}>{jogo.placarCasa}</span>
                  ) : podeEditar ? (
                    <input
                      name={`placarCasa_${jogo.id}`}
                      type="number"
                      min={0}
                      max={99}
                      defaultValue={jogo.palpite?.placarCasa}
                      className={boxClass}
                    />
                  ) : (
                    <span className={boxClass}>–</span>
                  )}
                  <span className="font-bold text-slate-400">x</span>
                  {resultadoSaiu ? (
                    <span className={boxClass}>{jogo.placarVisitante}</span>
                  ) : podeEditar ? (
                    <input
                      name={`placarVisitante_${jogo.id}`}
                      type="number"
                      min={0}
                      max={99}
                      defaultValue={jogo.palpite?.placarVisitante}
                      className={boxClass}
                    />
                  ) : (
                    <span className={boxClass}>–</span>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  <Jersey {...jogo.timeVisitante} size={40} />
                  <span className="truncate text-sm font-bold text-slate-900 dark:text-slate-50">
                    {jogo.timeVisitante.sigla}
                  </span>
                </div>
              </div>

              <span className="text-xs text-slate-400 dark:text-slate-500">
                {new Date(jogo.dataHora).toLocaleString("pt-BR", { timeZone: TIMEZONE_BRASIL })}
              </span>


              {travado && jogo.palpitesRevelados && meuUsuarioId && (
                <div className="mt-2 w-full">
                  <p className="mb-2 text-center text-[11px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                    Palpites da rodada
                  </p>
                  <PalpitesRevelados
                    palpites={jogo.palpitesRevelados}
                    meuUsuarioId={meuUsuarioId}
                    layout={layoutRevelacao}
                  />
                </div>
              )}
            </div>
          );
        })}

        {temJogoEditavel && (
          <>
            {state.error && <p className="text-center text-sm text-red-600 dark:text-red-400">{state.error}</p>}
            {state.success && (
              <p className="text-center text-sm text-emerald-600 dark:text-emerald-400">
                Palpites salvos! Um comprovante será enviado para o seu email.
              </p>
            )}
            <Button type="submit" disabled={pending} className="self-center">
              {pending ? "Salvando..." : "Salvar Palpites e enviar para o email"}
            </Button>
          </>
        )}
      </form>
    </Card>
  );
}








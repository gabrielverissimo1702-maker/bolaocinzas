"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { IconPlus, IconShield, IconTrophy, IconKey, IconArrowRight } from "@/components/ui/icons";
import { useModo } from "@/lib/ModoContext";
import { entrarComCodigo, type SavesActionState } from "@/app/actions/saves";
import { TorneioCard } from "@/components/TorneioCard";
import type { TorneioResumo } from "@/lib/dashboard/torneiosUsuario";
import type { ResumoSaveAdmin } from "@/lib/dashboard/resumoAdmin";

const TIPO_LABEL: Record<string, string> = { LIGA: "Liga", COPA: "Copa", SUPERCOPA: "Supercopa" };
const entrarInitialState: SavesActionState = {};

function EntrarComCodigoForm() {
  const [state, formAction, pending] = useActionState(entrarComCodigo, entrarInitialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input
        name="codigo"
        type="text"
        placeholder="Digite o código recebido"
        required
        className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2.5 text-center font-mono text-sm tracking-widest text-slate-100 uppercase outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
      />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Adicionando..." : "Adicionar Código"}
      </Button>
      {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}
    </form>
  );
}

export function HomeView({
  nome,
  torneios,
  pendentesSolicitacao,
  saves,
  solicitacoesPendentesAdmin,
}: {
  nome: string;
  torneios: TorneioResumo[];
  pendentesSolicitacao: number;
  saves: ResumoSaveAdmin[];
  solicitacoesPendentesAdmin: number;
}) {
  const { modo } = useModo();
  const torneiosDestaque = torneios.slice(0, 2);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Olá, {nome}</h1>

      {modo === "USUARIO" ? (
        <div className="mt-6 flex flex-col gap-6">
          <Card>
            <div className="mb-1 flex items-center gap-2">
              <IconKey className="h-4 w-4 text-emerald-500" />
              <p className="font-semibold text-emerald-500">Chave de acesso</p>
            </div>
            <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
              Adicione uma chave recebida do admin para liberar o acesso ao Save e aos torneios.
            </p>
            <EntrarComCodigoForm />
            {pendentesSolicitacao > 0 && (
              <div className="mt-2">
                <Badge tone="warning">{pendentesSolicitacao} solicitação(ões) pendente(s)</Badge>
              </div>
            )}
          </Card>

          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-50">Meus torneios</p>
            <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
              Os dois próximos torneios ativos com sua classificação e check de palpites.
            </p>

            {torneiosDestaque.length > 0 ? (
              <div className="mb-3 grid gap-3 sm:grid-cols-2">
                {torneiosDestaque.map((t) => (
                  <TorneioCard key={t.competicaoId} torneio={t} />
                ))}
              </div>
            ) : (
              <p className="mb-3 text-sm text-slate-400 dark:text-slate-500">
                Você ainda não participa de nenhum torneio. Use a chave de acesso acima pra começar.
              </p>
            )}

            <Link
              href="/usuario/temporadas"
              className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:underline dark:text-emerald-400"
            >
              Ver todos os torneios
              <IconArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {saves.map((save) => (
              <Card key={save.saveId}>
                <Link href={`/admin/saves/${save.saveId}`} className="hover:opacity-80">
                  <p className="font-semibold text-slate-900 dark:text-slate-50">{save.saveNome}</p>
                  <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                    Código: <span className="font-mono">{save.codigoAcesso}</span>
                  </p>
                </Link>
                <div className="flex flex-col gap-1.5">
                  {save.competicoes.map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300">
                        {TIPO_LABEL[c.tipo]}: {c.nome}
                      </span>
                      <Badge tone={c.status === "ENCERRADA" ? "neutral" : "success"}>
                        {c.status === "ENCERRADA" ? "Encerrada" : "Em andamento"}
                      </Badge>
                    </div>
                  ))}
                  {save.competicoes.length === 0 && (
                    <p className="text-sm text-slate-400 dark:text-slate-500">Nenhuma competição ainda.</p>
                  )}
                </div>
              </Card>
            ))}

            <Link
              href="/admin/saves"
              className="flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 p-5 text-center font-semibold text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-emerald-600 dark:hover:text-emerald-400"
            >
              <IconPlus className="h-5 w-5" />
              Criar um save
              {solicitacoesPendentesAdmin > 0 && (
                <span className="mt-1">
                  <Badge tone="warning">{solicitacoesPendentesAdmin} solicitação(ões) pendente(s)</Badge>
                </span>
              )}
            </Link>
          </div>

          <Card>
            <p className="mb-3 font-semibold text-slate-900 dark:text-slate-50">Adicionar / atualizar</p>
            <div className="flex flex-wrap gap-3">
              <LinkButton
                href={saves.length === 1 ? `/admin/saves/${saves[0].saveId}/times` : "/admin/saves"}
                variant="outline"
              >
                <IconShield className="h-4 w-4" />
                Cadastrar / atualizar times
              </LinkButton>
              <LinkButton href="/admin/saves" variant="outline">
                <IconTrophy className="h-4 w-4" />
                Cadastrar / atualizar jogos
              </LinkButton>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}



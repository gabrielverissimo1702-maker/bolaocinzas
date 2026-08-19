import Link from "next/link";
import { requireUsuario } from "@/lib/auth/session";
import { historicoUsuario, type ResultadoHistorico } from "@/lib/dashboard/historicoUsuario";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TipoTag } from "@/components/ui/TipoTag";
import { IconTrophy } from "@/components/ui/icons";

function ResultadoBadge({ resultado }: { resultado: ResultadoHistorico }) {
  if (resultado.campeao) return <Badge tone="warning">Campeão</Badge>;
  if (resultado.vice) return <Badge tone="neutral">Vice-campeão</Badge>;
  if (resultado.tipo === "LIGA") {
    return (
      <Badge tone="neutral">
        {resultado.posicao}º de {resultado.totalParticipantes}
      </Badge>
    );
  }
  return <Badge tone="neutral">{resultado.faseEliminado ? `Eliminado · ${resultado.faseEliminado}` : "Eliminado"}</Badge>;
}

export default async function HistoricoPage() {
  const usuario = await requireUsuario();
  const resultados = await historicoUsuario(usuario.id);
  const trofeus = resultados.filter((r) => r.campeao);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Histórico" backHref="/" backLabel="Início" />

      <Card className="mb-6 rounded-2xl border-amber-200 bg-gradient-to-b from-amber-50 to-white text-center dark:border-amber-900/40 dark:from-amber-950/20 dark:to-slate-950">
        <p className="text-xs font-bold tracking-widest text-amber-600 uppercase dark:text-amber-400">
          Sala de troféus
        </p>

        {trofeus.length > 0 ? (
          <>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {trofeus.map((t) => (
                <Link
                  key={t.competicaoId}
                  href={t.href}
                  className="flex w-20 flex-col items-center gap-1.5"
                  title={t.competicaoNome}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-[0_0_12px_rgba(251,191,36,0.5)]">
                    <IconTrophy className="h-6 w-6" />
                  </div>
                  <span className="max-w-full truncate text-[11px] font-medium text-slate-600 dark:text-slate-400">
                    {t.competicaoNome}
                  </span>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-3xl font-extrabold text-amber-600 dark:text-amber-400">{trofeus.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              título{trofeus.length !== 1 ? "s" : ""} conquistado{trofeus.length !== 1 ? "s" : ""}
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
              <IconTrophy className="h-6 w-6" />
            </div>
            <p className="mt-3 font-semibold text-slate-900 dark:text-slate-50">Ainda sem títulos</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Continue participando pra conquistar seu primeiro troféu.
            </p>
          </>
        )}
      </Card>

      <p className="mb-2 text-xs font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">
        Competições encerradas
      </p>
      <ul className="flex flex-col gap-2">
        {resultados.map((r) => (
          <li key={r.competicaoId}>
            <Link href={r.href}>
              <Card className="flex items-center justify-between gap-3 py-3 transition hover:border-slate-400 dark:hover:border-slate-600">
                <div className="flex min-w-0 items-center gap-3">
                  <TipoTag tipo={r.tipo} />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900 dark:text-slate-50">{r.competicaoNome}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {r.saveNome} · {r.temporadaNome}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <ResultadoBadge resultado={r} />
                </div>
              </Card>
            </Link>
          </li>
        ))}
        {resultados.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma competição encerrada ainda.</p>
        )}
      </ul>
    </div>
  );
}

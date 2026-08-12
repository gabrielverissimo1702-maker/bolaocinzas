import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { RodadaResumo, StatusRodada } from "@/lib/dashboard/resumoRodadas";

const STATUS_LABEL: Record<StatusRodada, string> = {
  finalizada: "Finalizada",
  em_andamento: "Em andamento",
  disponivel: "Disponível",
  aguardando_jogos: "Aguardando jogos",
};

const STATUS_TONE: Record<StatusRodada, "success" | "info" | "warning" | "neutral"> = {
  finalizada: "neutral",
  em_andamento: "success",
  disponivel: "info",
  aguardando_jogos: "warning",
};

export function RodadasResumoLista({ rodadas, href }: { rodadas: RodadaResumo[]; href: string }) {
  if (rodadas.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma rodada cadastrada ainda.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {rodadas.map((r) => (
        <Link key={r.id} href={href}>
          <Card className="flex items-center justify-between py-3 transition hover:border-slate-400 dark:hover:border-slate-600">
            <p className="font-medium text-slate-900 dark:text-slate-50">{r.nome}</p>
            <div className="flex items-center gap-3">
              <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
              <span className="text-sm font-semibold tabular-nums text-slate-500 dark:text-slate-400">
                {r.feitos}/{r.total}
              </span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}

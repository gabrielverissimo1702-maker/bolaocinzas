import Link from "next/link";
import { requireUsuario } from "@/lib/auth/session";
import { cardsParaPalpitar, cardsParaVerPalpites, type PalpitesHubCard } from "@/lib/dashboard/palpitesHub";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { TipoTag } from "@/components/ui/TipoTag";

function tonePorStatus(status: string): "success" | "warning" | "info" {
  if (status === "Completo") return "success";
  if (status === "Aberto") return "warning";
  return "info";
}

function HubCard({ card }: { card: PalpitesHubCard }) {
  return (
    <Link href={card.href}>
      <Card className="flex items-center justify-between py-3 transition hover:border-slate-400 dark:hover:border-slate-600">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <TipoTag tipo={card.competicaoTipo} />
            <span className="truncate text-xs font-semibold text-slate-400">{card.competicaoNome}</span>
          </div>
          <p className="truncate font-medium text-slate-900 dark:text-slate-50">{card.etapaNome}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Badge tone={tonePorStatus(card.status)}>{card.status}</Badge>
          <span className="text-sm font-semibold tabular-nums text-slate-500 dark:text-slate-400">
            {card.quantidadeJogos} jogos
          </span>
        </div>
      </Card>
    </Link>
  );
}

function SecaoHub({
  titulo,
  descricao,
  cards,
  vazio,
}: {
  titulo: string;
  descricao: string;
  cards: PalpitesHubCard[];
  vazio: string;
}) {
  return (
    <section className="mb-8">
      <div className="mb-3">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          {titulo}
        </p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{descricao}</p>
      </div>
      {cards.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/70 text-sm text-slate-400">{vazio}</Card>
      ) : (
        <div className="flex flex-col gap-2">
          {cards.map((card) => (
            <HubCard key={card.chave} card={card} />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function PalpitesPage() {
  const usuario = await requireUsuario();
  const [paraPalpitar, paraVer] = await Promise.all([
    cardsParaPalpitar(usuario.id),
    cardsParaVerPalpites(usuario.id),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Palpites" backHref="/" backLabel="Início" />

      <SecaoHub
        titulo="Palpitar"
        descricao="Rodadas e fases abertas para você enviar seus palpites."
        cards={paraPalpitar}
        vazio="Nenhuma rodada ou fase aberta para palpitar agora."
      />

      <SecaoHub
        titulo="Ver palpites"
        descricao="Rodadas e fases recentes liberadas para consulta."
        cards={paraVer}
        vazio="Nenhuma rodada ou fase liberada para consulta ainda."
      />
    </div>
  );
}

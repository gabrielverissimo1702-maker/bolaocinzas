import { requireUsuario } from "@/lib/auth/session";
import { cardsParaPalpitar, cardsParaVerPalpites, type PalpitesHubCard } from "@/lib/dashboard/palpitesHub";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { TipoTag } from "@/components/ui/TipoTag";

function formatarPrazo(data: Date | null) {
  if (!data) return "Sem horário";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

function HubCard({ card, acao }: { card: PalpitesHubCard; acao: "palpitar" | "ver" }) {
  return (
    <Card className="border-slate-800 bg-gradient-to-b from-[#1a2035] to-[#0d1220] p-4 text-white shadow-lg">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <TipoTag tipo={card.competicaoTipo} />
            <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-cyan-300 ring-1 ring-cyan-400/20">
              {card.status}
            </span>
          </div>
          <p className="truncate text-base font-extrabold text-white">{card.competicaoNome}</p>
          <p className="truncate text-xs font-semibold text-slate-400">{card.temporadaNome}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-extrabold text-cyan-300">{card.quantidadeJogos}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">jogos</p>
        </div>
      </div>

      <div className="mb-4 rounded-lg border border-slate-700/70 bg-slate-950/35 px-3 py-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Rodada/Fase</p>
        <p className="font-bold text-slate-100">{card.etapaNome}</p>
        <p className="mt-1 text-xs text-slate-400">Prazo: {formatarPrazo(card.prazo)}</p>
      </div>

      <LinkButton href={card.href} className="w-full" variant={acao === "palpitar" ? "primary" : "outline"}>
        {acao === "palpitar" ? "Fazer palpites" : "Ver palpites"}
      </LinkButton>
    </Card>
  );
}

function SecaoHub({
  titulo,
  descricao,
  cards,
  vazio,
  acao,
}: {
  titulo: string;
  descricao: string;
  cards: PalpitesHubCard[];
  vazio: string;
  acao: "palpitar" | "ver";
}) {
  return (
    <section className="mb-8">
      <div className="mb-3">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-300">{titulo}</p>
        <p className="mt-1 text-sm text-slate-400">{descricao}</p>
      </div>
      {cards.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/70 text-sm text-slate-400">{vazio}</Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((card) => (
            <HubCard key={card.chave} card={card} acao={acao} />
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
        acao="palpitar"
      />

      <SecaoHub
        titulo="Ver palpites"
        descricao="Rodadas e fases recentes liberadas para consulta."
        cards={paraVer}
        vazio="Nenhuma rodada ou fase liberada para consulta ainda."
        acao="ver"
      />
    </div>
  );
}

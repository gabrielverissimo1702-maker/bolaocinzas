import { notFound } from "next/navigation";
import { requireUsuario } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { torneiosDaTemporada } from "@/lib/dashboard/torneiosUsuario";
import { jogosParaPalpitar } from "@/lib/dashboard/jogosParaPalpitar";
import { TorneioCard } from "@/components/TorneioCard";
import { JogoResumo } from "@/components/JogoResumo";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function PainelTemporadaPage({
  params,
}: {
  params: Promise<{ temporadaId: string }>;
}) {
  const usuario = await requireUsuario();
  const { temporadaId } = await params;

  const participante = await prisma.temporadaParticipante.findUnique({
    where: { temporadaId_usuarioId: { temporadaId, usuarioId: usuario.id } },
    include: { temporada: true },
  });

  if (!participante || participante.status !== "APROVADO") notFound();

  const [torneios, jogosPendentes] = await Promise.all([
    torneiosDaTemporada(temporadaId, usuario.id),
    jogosParaPalpitar(usuario.id, { temporadaId, apenasPendentes: true }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={participante.temporada.nome}
        backHref="/usuario/saves"
        backLabel="Minhas Saves"
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        {torneios.map((t) => (
          <TorneioCard key={t.competicaoId} torneio={t} />
        ))}
        {torneios.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhuma competição criada ainda nesta temporada.
          </p>
        )}
      </div>

      <p className="mb-2 font-semibold text-slate-900 dark:text-slate-50">Jogos disponíveis para palpitar</p>
      {jogosPendentes.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum jogo pendente de palpite no momento.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {jogosPendentes.slice(0, 6).map((j) => (
            <JogoResumo key={j.id} jogo={j} cabecalho={`${j.competicaoNome} · ${j.etapaNome}`} href={j.href} compacto />
          ))}
        </div>
      )}
    </div>
  );
}

import { requireUsuario } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { JogoResumo } from "@/components/JogoResumo";
import { ResultadoForm } from "@/components/admin/ResultadoForm";

export default async function AtualizarPage() {
  const usuario = await requireUsuario();

  const jogos = await prisma.jogo.findMany({
    where: {
      placarCasa: null,
      etapa: { competicao: { temporada: { save: { criadorId: usuario.id } } } },
    },
    include: {
      timeCasa: true,
      timeVisitante: true,
      etapa: {
        include: {
          competicao: { include: { temporada: { include: { save: true } } } },
        },
      },
    },
    orderBy: { dataHora: "asc" },
  });

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Atualizar Resultados" backHref="/" backLabel="Início" />

      {jogos.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Nenhum jogo pendente de resultado no momento.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {jogos.map((jogo) => (
            <div key={jogo.id} className="flex flex-col gap-2">
              <JogoResumo
                jogo={jogo}
                cabecalho={`${jogo.etapa.competicao.temporada.save.nome} · ${jogo.etapa.competicao.nome} · ${jogo.etapa.nome}`}
                compacto
              />
              <div className="flex justify-end">
                <ResultadoForm jogoId={jogo.id} saveId={jogo.etapa.competicao.temporada.save.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

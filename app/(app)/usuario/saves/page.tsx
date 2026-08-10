import Link from "next/link";
import { requireUsuario } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { IconArrowRight } from "@/components/ui/icons";

interface TemporadaResumo {
  id: string;
  nome: string;
  emAndamento: boolean;
}

interface SaveGrupo {
  id: string;
  nome: string;
  temporadas: TemporadaResumo[];
  total: number;
}

export default async function MeusSavesPage() {
  const usuario = await requireUsuario();

  const participacoes = await prisma.temporadaParticipante.findMany({
    where: { usuarioId: usuario.id, status: "APROVADO" },
    include: {
      temporada: {
        include: {
          save: true,
          competicoes: { select: { status: true } },
        },
      },
    },
    orderBy: { temporada: { createdAt: "desc" } },
  });

  const grupos = new Map<string, SaveGrupo>();
  for (const p of participacoes) {
    const save = p.temporada.save;
    const emAndamento =
      p.temporada.competicoes.length === 0 || p.temporada.competicoes.some((c) => c.status !== "ENCERRADA");

    const grupo = grupos.get(save.id) ?? { id: save.id, nome: save.nome, temporadas: [], total: 0 };
    grupo.temporadas.push({ id: p.temporadaId, nome: p.temporada.nome, emAndamento });
    grupo.total++;
    grupos.set(save.id, grupo);
  }
  const listaSaves = [...grupos.values()];

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Meus Saves" backHref="/" backLabel="Início" />

      <div className="flex flex-col gap-6">
        {listaSaves.map((save) => (
          <div key={save.id}>
            <p className="mb-2 font-semibold text-slate-900 dark:text-slate-50">{save.nome}</p>
            <div className="flex flex-col gap-2">
              {save.temporadas.slice(0, 2).map((t) => (
                <Link key={t.id} href={`/usuario/temporadas/${t.id}`}>
                  <Card className="flex items-center justify-between py-3 transition hover:border-slate-400 dark:hover:border-slate-600">
                    <p className="font-medium text-slate-900 dark:text-slate-50">{t.nome}</p>
                    <Badge tone={t.emAndamento ? "success" : "neutral"}>
                      {t.emAndamento ? "Em andamento" : "Encerrada"}
                    </Badge>
                  </Card>
                </Link>
              ))}
            </div>
            {save.total > 2 && (
              <Link
                href={`/usuario/saves/${save.id}`}
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:underline dark:text-slate-400"
              >
                Ver temporadas anteriores
                <IconArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        ))}
        {listaSaves.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Você ainda não está registrado em nenhum save.
          </p>
        )}
      </div>
    </div>
  );
}

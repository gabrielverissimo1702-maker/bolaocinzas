import { notFound } from "next/navigation";
import { requireUsuario } from "@/lib/auth/session";
import { requireSaveOwner } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { decidirParticipante, removerParticipante } from "@/app/actions/saves";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { UsuarioUniforme } from "@/components/UsuarioUniforme";

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: "Pendente",
  APROVADO: "Aprovado",
  REJEITADO: "Rejeitado",
  REMOVIDO: "Removido",
};

const STATUS_TONE: Record<string, "warning" | "success" | "danger" | "neutral"> = {
  PENDENTE: "warning",
  APROVADO: "success",
  REJEITADO: "danger",
  REMOVIDO: "neutral",
};

export default async function ParticipantesPage({
  params,
}: {
  params: Promise<{ saveId: string }>;
}) {
  const usuario = await requireUsuario();
  const { saveId } = await params;

  const save = await requireSaveOwner(saveId, usuario.id).catch(() => null);
  if (!save) notFound();

  const participantes = await prisma.temporadaParticipante.findMany({
    where: { temporada: { saveId } },
    orderBy: [{ status: "asc" }, { solicitadoEm: "desc" }],
    include: { usuario: true, temporada: true },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Participantes" backHref={`/admin/saves/${saveId}`} backLabel={save.nome} />

      <ul className="flex flex-col gap-3">
        {participantes.map((p) => (
          <Card key={p.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <UsuarioUniforme usuario={p.usuario} size={30} className="text-slate-900 dark:text-slate-50" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {p.usuario.email} · Temporada: {p.temporada.nome}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status]}</Badge>
              {p.status === "PENDENTE" && (
                <>
                  <form action={decidirParticipante.bind(null, p.id, saveId, true)}>
                    <Button type="submit" size="sm">
                      Aprovar
                    </Button>
                  </form>
                  <form action={decidirParticipante.bind(null, p.id, saveId, false)}>
                    <Button type="submit" variant="outline" size="sm">
                      Rejeitar
                    </Button>
                  </form>
                </>
              )}
              {p.status === "APROVADO" && (
                <form action={removerParticipante.bind(null, p.id, saveId)}>
                  <Button type="submit" variant="danger" size="sm">
                    Remover
                  </Button>
                </form>
              )}
            </div>
          </Card>
        ))}
        {participantes.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Nenhuma solicitação de participação ainda.
          </p>
        )}
      </ul>
    </div>
  );
}


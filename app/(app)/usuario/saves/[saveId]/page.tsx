import { notFound } from "next/navigation";
import { requireUsuario } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { solicitarAcessoTemporada } from "@/app/actions/temporadas";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const STATUS_LABEL: Record<string, string> = {
  PENDENTE: "Solicitação pendente",
  APROVADO: "Você participa",
  REJEITADO: "Solicitação rejeitada",
  REMOVIDO: "Removido",
};

export default async function UsuarioSaveDetailPage({
  params,
}: {
  params: Promise<{ saveId: string }>;
}) {
  const usuario = await requireUsuario();
  const { saveId } = await params;

  const save = await prisma.save.findUnique({ where: { id: saveId } });
  if (!save) notFound();

  const temporadas = await prisma.temporada.findMany({
    where: { saveId },
    orderBy: { createdAt: "desc" },
    include: {
      participantes: { where: { usuarioId: usuario.id } },
    },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={save.nome} backHref="/usuario/temporadas" backLabel="Minhas Temporadas" />

      <ul className="flex flex-col gap-3">
        {temporadas.map((temporada) => {
          const participante = temporada.participantes[0];
          const podeAcessar = participante?.status === "APROVADO";
          const podeSolicitar =
            !participante || participante.status === "REJEITADO" || participante.status === "REMOVIDO";

          return (
            <Card key={temporada.id} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-50">{temporada.nome}</p>
                {temporada.status === "FECHADA" && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">Inscrições fechadas</p>
                )}
              </div>

              {podeAcessar ? (
                <LinkButton href={`/usuario/temporadas/${temporada.id}`}>Acessar</LinkButton>
              ) : podeSolicitar && temporada.status === "ABERTA" ? (
                <form action={solicitarAcessoTemporada.bind(null, temporada.id, saveId)}>
                  <Button type="submit" variant="outline">
                    Solicitar acesso
                  </Button>
                </form>
              ) : (
                <Badge tone="neutral">{participante ? STATUS_LABEL[participante.status] : "Inscrições fechadas"}</Badge>
              )}
            </Card>
          );
        })}
        {temporadas.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">Este save ainda não tem temporadas.</p>
        )}
      </ul>
    </div>
  );
}

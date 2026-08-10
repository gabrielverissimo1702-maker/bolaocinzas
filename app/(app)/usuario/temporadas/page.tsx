import { requireUsuario } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { IconTicket } from "@/components/ui/icons";

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

export default async function MinhasTemporadasPage() {
  const usuario = await requireUsuario();

  const participacoes = await prisma.temporadaParticipante.findMany({
    where: { usuarioId: usuario.id },
    orderBy: { solicitadoEm: "desc" },
    include: { temporada: { include: { save: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Minhas Temporadas"
        action={
          <LinkButton href="/usuario/entrar">
            <IconTicket className="h-4 w-4" />
            Entrar em um save
          </LinkButton>
        }
      />

      <ul className="flex flex-col gap-3">
        {participacoes.map((p) => (
          <Card key={p.id} className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-50">{p.temporada.nome}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{p.temporada.save.nome}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status]}</Badge>
              {p.status === "APROVADO" && (
                <LinkButton href={`/usuario/temporadas/${p.temporadaId}`} variant="outline" size="sm">
                  Acessar
                </LinkButton>
              )}
            </div>
          </Card>
        ))}
        {participacoes.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Você ainda não entrou em nenhum save. Peça o código de acesso ao administrador.
          </p>
        )}
      </ul>
    </div>
  );
}

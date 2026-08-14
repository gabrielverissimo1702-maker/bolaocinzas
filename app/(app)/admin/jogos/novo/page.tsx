import { requireUsuario } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { NovoJogoFormGeral, type SaveOpcaoJogo } from "../NovoJogoFormGeral";

export default async function NovoJogoGeralPage() {
  const usuario = await requireUsuario();

  const savesDb = await prisma.save.findMany({
    where: { criadorId: usuario.id },
    orderBy: { nome: "asc" },
    include: {
      times: { orderBy: { nome: "asc" } },
      temporadas: {
        orderBy: { createdAt: "desc" },
        include: {
          competicoes: {
            orderBy: { createdAt: "asc" },
            include: { etapas: { orderBy: { ordem: "asc" } } },
          },
        },
      },
    },
  });

  const saves: SaveOpcaoJogo[] = savesDb.map((s) => ({
    id: s.id,
    nome: s.nome,
    times: s.times.map((t) => ({ id: t.id, nome: t.nome })),
    temporadas: s.temporadas.map((t) => ({
      id: t.id,
      nome: t.nome,
      competicoes: t.competicoes.map((c) => ({
        id: c.id,
        nome: c.nome,
        tipo: c.tipo,
        etapas: c.etapas.map((e) => ({ id: e.id, nome: e.nome })),
      })),
    })),
  }));

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Cadastrar jogo" backHref="/admin/jogos" backLabel="Jogos" />
      <Card>
        <NovoJogoFormGeral saves={saves} />
      </Card>
    </div>
  );
}

import { notFound } from "next/navigation";
import { requireUsuario } from "@/lib/auth/session";
import { requireSaveOwner } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { NovaCompeticaoForm } from "./NovaCompeticaoForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default async function NovaCompeticaoPage({
  params,
}: {
  params: Promise<{ saveId: string; temporadaId: string }>;
}) {
  const usuario = await requireUsuario();
  const { saveId, temporadaId } = await params;

  const save = await requireSaveOwner(saveId, usuario.id).catch(() => null);
  if (!save) notFound();

  const temporada = await prisma.temporada.findUnique({ where: { id: temporadaId } });
  if (!temporada || temporada.saveId !== saveId) notFound();

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="Criar competição"
        backHref={`/admin/saves/${saveId}/temporadas/${temporadaId}`}
        backLabel={temporada.nome}
      />

      <Card>
        <NovaCompeticaoForm saveId={saveId} temporadaId={temporadaId} />
      </Card>
    </div>
  );
}

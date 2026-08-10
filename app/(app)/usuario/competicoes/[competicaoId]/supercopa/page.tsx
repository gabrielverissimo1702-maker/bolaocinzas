import { requireUsuario } from "@/lib/auth/session";
import { HubChaveamento } from "@/components/HubChaveamento";

export default async function SupercopaPage({
  params,
}: {
  params: Promise<{ competicaoId: string }>;
}) {
  const usuario = await requireUsuario();
  const { competicaoId } = await params;

  return <HubChaveamento competicaoId={competicaoId} usuarioId={usuario.id} tipo="SUPERCOPA" />;
}

import { requireUsuario } from "@/lib/auth/session";
import { ChaveamentoArvore } from "@/components/ChaveamentoArvore";

export default async function ChaveamentoCompletoPage({
  params,
}: {
  params: Promise<{ competicaoId: string }>;
}) {
  const usuario = await requireUsuario();
  const { competicaoId } = await params;

  return <ChaveamentoArvore competicaoId={competicaoId} usuarioId={usuario.id} tipo="COPA" />;
}

import { requireUsuario } from "@/lib/auth/session";
import { jogosDoAdmin } from "@/lib/dashboard/jogosAdmin";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdminJogosFiltrados } from "@/components/admin/AdminJogosFiltrados";

export default async function AtualizarPage() {
  const usuario = await requireUsuario();
  const jogos = await jogosDoAdmin(usuario.id);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Atualizar Resultados" backHref="/" backLabel="Início" />

      {jogos.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum jogo cadastrado ainda.</p>
      ) : (
        <AdminJogosFiltrados jogos={jogos} />
      )}
    </div>
  );
}

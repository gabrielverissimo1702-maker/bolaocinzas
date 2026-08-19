import { requireUsuario } from "@/lib/auth/session";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Jersey } from "@/components/ui/Jersey";
import { PerfilForm } from "./PerfilForm";

export default async function PerfilPage() {
  const usuario = await requireUsuario();

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Perfil" backHref="/" backLabel="Início" />

      <Card className="mb-4 flex items-center gap-4">
        <Jersey
          cores={usuario.cores}
          padraoUniforme={usuario.padraoUniforme}
          sigla={usuario.sigla}
          corSigla={usuario.corSigla}
          size={56}
        />
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-50">{usuario.nome}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{usuario.email}</p>
        </div>
      </Card>

      <Card>
        <p className="mb-3 font-semibold text-slate-900 dark:text-slate-50">Editar perfil</p>
        <PerfilForm
          nome={usuario.nome}
          sigla={usuario.sigla}
          cores={usuario.cores}
          padraoUniforme={usuario.padraoUniforme}
          corSigla={usuario.corSigla}
        />
      </Card>
    </div>
  );
}

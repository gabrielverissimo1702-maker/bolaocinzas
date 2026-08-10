import { requireUsuario } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { torneiosUsuario } from "@/lib/dashboard/torneiosUsuario";
import { resumoSavesAdmin } from "@/lib/dashboard/resumoAdmin";
import { HomeView } from "./HomeView";

export default async function HomePage() {
  const usuario = await requireUsuario();

  const [pendentesSolicitacao, solicitacoesPendentesAdmin, torneios, saves] = await Promise.all([
    prisma.temporadaParticipante.count({
      where: { usuarioId: usuario.id, status: "PENDENTE" },
    }),
    prisma.temporadaParticipante.count({
      where: { status: "PENDENTE", temporada: { save: { criadorId: usuario.id } } },
    }),
    torneiosUsuario(usuario.id),
    resumoSavesAdmin(usuario.id),
  ]);

  return (
    <HomeView
      nome={usuario.nome}
      torneios={torneios}
      pendentesSolicitacao={pendentesSolicitacao}
      saves={saves}
      solicitacoesPendentesAdmin={solicitacoesPendentesAdmin}
    />
  );
}

import { prisma } from "@/lib/prisma";

export interface ResumoSaveAdmin {
  saveId: string;
  saveNome: string;
  codigoAcesso: string;
  competicoes: { id: string; nome: string; tipo: string; status: string }[];
}

export async function resumoSavesAdmin(usuarioId: string): Promise<ResumoSaveAdmin[]> {
  const saves = await prisma.save.findMany({
    where: { criadorId: usuarioId },
    orderBy: { createdAt: "desc" },
    include: {
      temporadas: {
        include: { competicoes: { orderBy: { createdAt: "desc" } } },
      },
    },
  });

  return saves.map((save) => ({
    saveId: save.id,
    saveNome: save.nome,
    codigoAcesso: save.codigoAcesso,
    competicoes: save.temporadas.flatMap((t) =>
      t.competicoes.map((c) => ({ id: c.id, nome: c.nome, tipo: c.tipo, status: c.status }))
    ),
  }));
}

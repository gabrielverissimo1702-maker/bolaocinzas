import { prisma } from "@/lib/prisma";

export async function requireSaveOwner(saveId: string, usuarioId: string) {
  const save = await prisma.save.findUnique({ where: { id: saveId } });
  if (!save || save.criadorId !== usuarioId) {
    throw new Error("Você não tem permissão para gerenciar este save");
  }
  return save;
}

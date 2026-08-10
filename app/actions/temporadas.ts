"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth/session";
import { requireSaveOwner } from "@/lib/auth/authorization";
import { criarTemporadaSchema } from "@/lib/validation/saves";

export type TemporadasActionState = { error?: string };

export async function criarTemporada(
  _prevState: TemporadasActionState,
  formData: FormData
): Promise<TemporadasActionState> {
  const usuario = await requireUsuario();
  const saveId = String(formData.get("saveId") ?? "");
  await requireSaveOwner(saveId, usuario.id);

  const parsed = criarTemporadaSchema.safeParse({ nome: formData.get("nome") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  await prisma.temporada.create({
    data: { nome: parsed.data.nome, saveId },
  });

  revalidatePath(`/admin/saves/${saveId}/temporadas`);
  return {};
}

export async function alternarStatusTemporada(temporadaId: string, saveId: string) {
  const usuario = await requireUsuario();
  await requireSaveOwner(saveId, usuario.id);

  const temporada = await prisma.temporada.findUniqueOrThrow({ where: { id: temporadaId } });
  await prisma.temporada.update({
    where: { id: temporadaId },
    data: { status: temporada.status === "ABERTA" ? "FECHADA" : "ABERTA" },
  });

  revalidatePath(`/admin/saves/${saveId}/temporadas`);
}

export async function solicitarAcessoTemporada(temporadaId: string, saveId: string) {
  const usuario = await requireUsuario();

  const temporada = await prisma.temporada.findUnique({ where: { id: temporadaId } });
  if (!temporada || temporada.saveId !== saveId) {
    throw new Error("Temporada não encontrada");
  }

  await prisma.temporadaParticipante.upsert({
    where: { temporadaId_usuarioId: { temporadaId, usuarioId: usuario.id } },
    create: { temporadaId, usuarioId: usuario.id, status: "PENDENTE" },
    update: { status: "PENDENTE", decididoEm: null },
  });

  revalidatePath(`/usuario/saves/${saveId}`);
  revalidatePath("/usuario/temporadas");
}

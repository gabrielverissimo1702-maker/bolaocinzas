"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth/session";
import { requireSaveOwner } from "@/lib/auth/authorization";
import { criarTimeSchema } from "@/lib/validation/saves";

export type TimesActionState = { error?: string; success?: boolean };

export async function criarTime(
  _prevState: TimesActionState,
  formData: FormData
): Promise<TimesActionState> {
  const usuario = await requireUsuario();
  const saveId = String(formData.get("saveId") ?? "");
  await requireSaveOwner(saveId, usuario.id);

  const parsed = criarTimeSchema.safeParse({
    nome: formData.get("nome"),
    sigla: formData.get("sigla"),
    cores: formData.getAll("cores"),
    padraoUniforme: formData.get("padraoUniforme"),
    corSigla: formData.get("corSigla"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const existente = await prisma.time.findUnique({
    where: { saveId_nome: { saveId, nome: parsed.data.nome } },
  });
  if (existente) {
    return { error: "Já existe um time com esse nome neste save" };
  }

  await prisma.time.create({
    data: {
      saveId,
      nome: parsed.data.nome,
      sigla: parsed.data.sigla,
      cores: parsed.data.cores,
      padraoUniforme: parsed.data.padraoUniforme,
      corSigla: parsed.data.corSigla,
    },
  });

  revalidatePath(`/admin/saves/${saveId}/times`);
  return {};
}

export async function atualizarTime(
  _prevState: TimesActionState,
  formData: FormData
): Promise<TimesActionState> {
  const usuario = await requireUsuario();
  const timeId = String(formData.get("timeId") ?? "");
  const saveId = String(formData.get("saveId") ?? "");
  await requireSaveOwner(saveId, usuario.id);

  const parsed = criarTimeSchema.safeParse({
    nome: formData.get("nome"),
    sigla: formData.get("sigla"),
    cores: formData.getAll("cores"),
    padraoUniforme: formData.get("padraoUniforme"),
    corSigla: formData.get("corSigla"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const existente = await prisma.time.findUnique({
    where: { saveId_nome: { saveId, nome: parsed.data.nome } },
  });
  if (existente && existente.id !== timeId) {
    return { error: "Já existe um time com esse nome neste save" };
  }

  await prisma.time.update({
    where: { id: timeId },
    data: {
      nome: parsed.data.nome,
      sigla: parsed.data.sigla,
      cores: parsed.data.cores,
      padraoUniforme: parsed.data.padraoUniforme,
      corSigla: parsed.data.corSigla,
    },
  });

  revalidatePath(`/admin/saves/${saveId}/times`);
  return { success: true };
}

export async function removerTime(timeId: string, saveId: string) {
  const usuario = await requireUsuario();
  await requireSaveOwner(saveId, usuario.id);

  await prisma.time.delete({ where: { id: timeId } });

  revalidatePath(`/admin/saves/${saveId}/times`);
}

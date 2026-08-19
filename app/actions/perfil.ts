"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth/session";
import { perfilSchema } from "@/lib/validation/uniforme";

export type PerfilActionState = { error?: string; success?: boolean };

export async function atualizarPerfil(
  _prevState: PerfilActionState,
  formData: FormData
): Promise<PerfilActionState> {
  const usuario = await requireUsuario();

  const parsed = perfilSchema.safeParse({
    nome: formData.get("nome"),
    sigla: formData.get("sigla"),
    cores: formData.getAll("cores"),
    padraoUniforme: formData.get("padraoUniforme"),
    corSigla: formData.get("corSigla"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: parsed.data,
  });

  revalidatePath("/usuario/perfil");
  return { success: true };
}

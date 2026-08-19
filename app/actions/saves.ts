"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth/session";
import { requireSaveOwner } from "@/lib/auth/authorization";
import { gerarCodigoAcessoUnico } from "@/lib/codigoAcesso";
import { criarSaveSchema, entrarComCodigoSchema } from "@/lib/validation/saves";

export type SavesActionState = { error?: string };

export async function criarSave(
  _prevState: SavesActionState,
  formData: FormData
): Promise<SavesActionState> {
  const usuario = await requireUsuario();

  const parsed = criarSaveSchema.safeParse({ nome: formData.get("nome") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const codigoAcesso = await gerarCodigoAcessoUnico();

  const save = await prisma.save.create({
    data: {
      nome: parsed.data.nome,
      codigoAcesso,
      criadorId: usuario.id,
    },
  });

  revalidatePath("/admin/saves");
  redirect(`/admin/saves/${save.id}`);
}

export async function entrarComCodigo(
  _prevState: SavesActionState,
  formData: FormData
): Promise<SavesActionState> {
  await requireUsuario();

  const parsed = entrarComCodigoSchema.safeParse({ codigo: formData.get("codigo") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Código inválido" };
  }

  const save = await prisma.save.findUnique({
    where: { codigoAcesso: parsed.data.codigo },
  });

  if (!save) {
    return { error: "Código não encontrado" };
  }

  redirect(`/usuario/saves/${save.id}`);
}

export async function excluirSave(saveId: string) {
  const usuario = await requireUsuario();
  await requireSaveOwner(saveId, usuario.id);

  // Jogo referencia Time e CopaConfronto sem cascade — apaga primeiro pra evitar
  // violação de FK quando o Postgres decide a ordem das cascatas de exclusão.
  await prisma.jogo.deleteMany({ where: { etapa: { competicao: { temporada: { saveId } } } } });
  await prisma.save.delete({ where: { id: saveId } });

  revalidatePath("/admin/saves");
  redirect("/admin/saves");
}

export async function removerParticipante(temporadaParticipanteId: string, saveId: string) {
  const usuario = await requireUsuario();
  await requireSaveOwner(saveId, usuario.id);

  await prisma.temporadaParticipante.update({
    where: { id: temporadaParticipanteId },
    data: { status: "REMOVIDO", decididoEm: new Date() },
  });

  revalidatePath(`/admin/saves/${saveId}/participantes`);
}

export async function decidirParticipante(
  temporadaParticipanteId: string,
  saveId: string,
  aprovado: boolean
) {
  const usuario = await requireUsuario();
  await requireSaveOwner(saveId, usuario.id);

  await prisma.temporadaParticipante.update({
    where: { id: temporadaParticipanteId },
    data: { status: aprovado ? "APROVADO" : "REJEITADO", decididoEm: new Date() },
  });

  revalidatePath(`/admin/saves/${saveId}/participantes`);
}

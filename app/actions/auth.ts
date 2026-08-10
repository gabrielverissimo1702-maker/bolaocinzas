"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { criarSessao, destruirSessaoAtual } from "@/lib/auth/session";
import { cadastroSchema, loginSchema } from "@/lib/validation/auth";

export type AuthActionState = { error?: string };

export async function cadastrar(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = cadastroSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    senha: formData.get("senha"),
    sigla: formData.get("sigla"),
    cores: formData.getAll("cores"),
    padraoUniforme: formData.get("padraoUniforme"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { nome, email, senha, sigla, cores, padraoUniforme } = parsed.data;

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    return { error: "Já existe uma conta com esse email" };
  }

  const senhaHash = await hashPassword(senha);
  const usuario = await prisma.usuario.create({
    data: { nome, email, senhaHash, sigla, cores, padraoUniforme },
  });

  await criarSessao(usuario.id);
  redirect("/");
}

export async function entrar(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { email, senha } = parsed.data;

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) {
    return { error: "Email ou senha incorretos" };
  }

  const senhaCorreta = await verifyPassword(senha, usuario.senhaHash);
  if (!senhaCorreta) {
    return { error: "Email ou senha incorretos" };
  }

  await criarSessao(usuario.id);
  redirect("/");
}

export async function sair() {
  await destruirSessaoAtual();
  redirect("/login");
}

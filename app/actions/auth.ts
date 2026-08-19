"use server";

import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { criarSessao, destruirSessaoAtual } from "@/lib/auth/session";
import { cadastroSchema, loginSchema } from "@/lib/validation/auth";
import { enviarEmailVerificacao } from "@/lib/email";

export type AuthActionState = { error?: string; emailNaoVerificado?: boolean; email?: string };

const TOKEN_VALIDADE_HORAS = 24;

function gerarTokenVerificacao() {
  return randomBytes(32).toString("hex");
}

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
    corSigla: formData.get("corSigla"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { nome, email, senha, sigla, cores, padraoUniforme, corSigla } = parsed.data;

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    return { error: "Já existe uma conta com esse email" };
  }

  const senhaHash = await hashPassword(senha);
  const tokenVerificacao = gerarTokenVerificacao();
  const tokenVerificacaoExpiraEm = new Date(Date.now() + TOKEN_VALIDADE_HORAS * 60 * 60 * 1000);

  const usuario = await prisma.usuario.create({
    data: {
      nome,
      email,
      senhaHash,
      sigla,
      cores,
      padraoUniforme,
      corSigla,
      tokenVerificacao,
      tokenVerificacaoExpiraEm,
    },
  });

  await enviarEmailVerificacao(usuario, tokenVerificacao);

  redirect(`/cadastro/confirme?email=${encodeURIComponent(usuario.email)}`);
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

  if (!usuario.emailVerificado) {
    return {
      error: "Confirme seu email antes de entrar. Verifique sua caixa de entrada.",
      emailNaoVerificado: true,
      email: usuario.email,
    };
  }

  await criarSessao(usuario.id);
  redirect("/");
}

export async function sair() {
  await destruirSessaoAtual();
  redirect("/login");
}

export type ReenviarVerificacaoState = { error?: string; success?: boolean };

export async function reenviarVerificacaoEmail(
  _prevState: ReenviarVerificacaoState,
  formData: FormData
): Promise<ReenviarVerificacaoState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) return { error: "Email inválido" };

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  // Não revela se o email existe ou não — evita enumeração de contas.
  if (!usuario || usuario.emailVerificado) {
    return { success: true };
  }

  const tokenVerificacao = gerarTokenVerificacao();
  const tokenVerificacaoExpiraEm = new Date(Date.now() + TOKEN_VALIDADE_HORAS * 60 * 60 * 1000);

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { tokenVerificacao, tokenVerificacaoExpiraEm },
  });

  await enviarEmailVerificacao(usuario, tokenVerificacao);

  return { success: true };
}

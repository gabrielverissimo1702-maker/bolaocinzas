import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "bolao_sessao";
const SESSAO_DURACAO_DIAS = 30;

export async function criarSessao(usuarioId: string) {
  const id = randomBytes(32).toString("hex");
  const expiraEm = new Date(Date.now() + SESSAO_DURACAO_DIAS * 24 * 60 * 60 * 1000);

  await prisma.sessao.create({
    data: { id, usuarioId, expiraEm },
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiraEm,
  });
}

export async function destruirSessaoAtual() {
  const cookieStore = await cookies();
  const sessaoId = cookieStore.get(COOKIE_NAME)?.value;

  if (sessaoId) {
    await prisma.sessao.deleteMany({ where: { id: sessaoId } });
  }

  cookieStore.delete(COOKIE_NAME);
}

export async function getUsuarioAtual() {
  const cookieStore = await cookies();
  const sessaoId = cookieStore.get(COOKIE_NAME)?.value;
  if (!sessaoId) return null;

  const sessao = await prisma.sessao.findUnique({
    where: { id: sessaoId },
    include: { usuario: true },
  });

  if (!sessao || sessao.expiraEm < new Date()) {
    if (sessao) await prisma.sessao.delete({ where: { id: sessaoId } });
    return null;
  }

  return sessao.usuario;
}

export async function requireUsuario() {
  const usuario = await getUsuarioAtual();
  if (!usuario) throw new Error("Não autenticado");
  return usuario;
}

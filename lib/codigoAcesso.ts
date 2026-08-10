import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem O/0/I/1 para evitar confusão

function gerarCodigo(tamanho = 6): string {
  const bytes = randomBytes(tamanho);
  let codigo = "";
  for (let i = 0; i < tamanho; i++) {
    codigo += ALFABETO[bytes[i] % ALFABETO.length];
  }
  return codigo;
}

export async function gerarCodigoAcessoUnico(): Promise<string> {
  for (let tentativa = 0; tentativa < 10; tentativa++) {
    const codigo = gerarCodigo();
    const existente = await prisma.save.findUnique({ where: { codigoAcesso: codigo } });
    if (!existente) return codigo;
  }
  throw new Error("Não foi possível gerar um código de acesso único");
}

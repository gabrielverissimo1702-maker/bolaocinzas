"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/auth/session";
import { enviarComprovantePalpites } from "@/lib/email";
import { jogoEstaTravado } from "@/lib/dashboard/palpitesRevelados";

export type PalpitesActionState = { error?: string; success?: boolean };

export async function salvarPalpitesLote(
  _prevState: PalpitesActionState,
  formData: FormData
): Promise<PalpitesActionState> {
  const usuario = await requireUsuario();

  const jogoIds = formData.getAll("jogoId").map(String);
  if (jogoIds.length === 0) return { error: "Nenhum jogo para salvar" };

  const jogos = await prisma.jogo.findMany({
    where: { id: { in: jogoIds } },
    include: {
      timeCasa: true,
      timeVisitante: true,
      etapa: { include: { competicao: true } },
    },
  });
  if (jogos.length === 0) return { error: "Jogos não encontrados" };

  const temporadaIds = [...new Set(jogos.map((j) => j.etapa.competicao.temporadaId))];
  for (const temporadaId of temporadaIds) {
    const participante = await prisma.temporadaParticipante.findUnique({
      where: { temporadaId_usuarioId: { temporadaId, usuarioId: usuario.id } },
    });
    if (!participante || participante.status !== "APROVADO") {
      return { error: "Você não participa desta temporada" };
    }
  }

  const operacoes = [];
  const itensComprovante: { timeCasa: string; timeVisitante: string; placarCasa: number; placarVisitante: number }[] =
    [];

  for (const jogo of jogos) {
    if (jogoEstaTravado(jogo.dataHora, jogo.placarCasa)) continue;

    const rawCasa = formData.get(`placarCasa_${jogo.id}`);
    const rawVisitante = formData.get(`placarVisitante_${jogo.id}`);
    if (rawCasa == null || rawVisitante == null || rawCasa === "" || rawVisitante === "") continue;

    const placarCasa = Number(rawCasa);
    const placarVisitante = Number(rawVisitante);
    if (
      !Number.isInteger(placarCasa) ||
      !Number.isInteger(placarVisitante) ||
      placarCasa < 0 ||
      placarVisitante < 0 ||
      placarCasa > 99 ||
      placarVisitante > 99
    ) {
      return { error: `Placar inválido em ${jogo.timeCasa.nome} x ${jogo.timeVisitante.nome}` };
    }

    operacoes.push(
      prisma.palpite.upsert({
        where: { jogoId_usuarioId: { jogoId: jogo.id, usuarioId: usuario.id } },
        create: { jogoId: jogo.id, usuarioId: usuario.id, placarCasa, placarVisitante },
        update: { placarCasa, placarVisitante },
      })
    );
    itensComprovante.push({ timeCasa: jogo.timeCasa.nome, timeVisitante: jogo.timeVisitante.nome, placarCasa, placarVisitante });
  }

  if (operacoes.length === 0) return { error: "Preencha ao menos um palpite" };

  await prisma.$transaction(operacoes);

  try {
    await enviarComprovantePalpites(usuario, jogos[0].etapa.nome, itensComprovante);
  } catch (e) {
    console.error("Falha ao enviar comprovante por email:", e);
  }

  revalidatePath("/usuario", "layout");
  revalidatePath("/", "layout");

  return { success: true };
}

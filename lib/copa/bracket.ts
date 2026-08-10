import { prisma } from "@/lib/prisma";
import { calcularByes, nomeDaFase } from "./byes";
import { pontosConfronto } from "@/lib/scoring/pontosConfronto";
import { aplicarCriterioDesempate } from "@/lib/scoring/tiebreak";

/**
 * `participantesEmOrdem` já reflete a decisão de bye/preliminar: os primeiros
 * `numByes` elementos recebem bye direto pra fase oficial, os demais
 * (`numPreliminar` elementos) jogam a fase preliminar em pares consecutivos.
 * A forma (sorteio/manual/híbrido) só muda como esse array é montado antes de
 * chamar esta função — o algoritmo de chaveamento em si é o mesmo.
 */
export async function gerarChaveamento(competicaoId: string, participantesEmOrdem: string[]) {
  const n = participantesEmOrdem.length;
  const { P, numPreliminar, numByes } = calcularByes(n);

  const byeIds = participantesEmOrdem.slice(0, numByes);
  const preliminarIds = participantesEmOrdem.slice(numByes);

  await prisma.$transaction(
    async (tx) => {
      const etapaOficial = await tx.etapa.create({
        data: { competicaoId, nome: nomeDaFase(P), ordem: 1, preliminar: false },
      });

      const confrontosOficiais = [];
      for (let i = 0; i < P / 2; i++) {
        confrontosOficiais.push(await tx.copaConfronto.create({ data: { etapaId: etapaOficial.id, ordem: i } }));
      }

      for (let i = 0; i < byeIds.length; i++) {
        const confrontoIndex = Math.floor(i / 2);
        const slot = i % 2 === 0 ? "A" : "B";
        await tx.copaConfronto.update({
          where: { id: confrontosOficiais[confrontoIndex].id },
          data: slot === "A" ? { participanteAId: byeIds[i] } : { participanteBId: byeIds[i] },
        });
      }

      if (numPreliminar > 0) {
        const etapaPreliminar = await tx.etapa.create({
          data: { competicaoId, nome: "Fase Preliminar", ordem: 0, preliminar: true },
        });

        for (let i = 0; i < preliminarIds.length / 2; i++) {
          const confrontoPreliminar = await tx.copaConfronto.create({
            data: {
              etapaId: etapaPreliminar.id,
              ordem: i,
              participanteAId: preliminarIds[i * 2],
              participanteBId: preliminarIds[i * 2 + 1],
            },
          });

          const slotGlobalIndex = numByes + i;
          const confrontoDestino = confrontosOficiais[Math.floor(slotGlobalIndex / 2)];
          const slotDestino = slotGlobalIndex % 2 === 0 ? "A" : "B";

          await tx.copaConfronto.update({
            where: { id: confrontoPreliminar.id },
            data: { proximoConfrontoId: confrontoDestino.id, proximoConfrontoSlot: slotDestino },
          });
        }
      }

      let rodadaAnterior = confrontosOficiais;
      let ordem = 2;
      while (rodadaAnterior.length > 1) {
        const participantesNaProximaRodada = rodadaAnterior.length;
        const proximaEtapa = await tx.etapa.create({
          data: { competicaoId, nome: nomeDaFase(participantesNaProximaRodada), ordem: ordem++, preliminar: false },
        });

        const proximaRodada = [];
        for (let i = 0; i < rodadaAnterior.length / 2; i++) {
          proximaRodada.push(await tx.copaConfronto.create({ data: { etapaId: proximaEtapa.id, ordem: i } }));
        }

        for (let i = 0; i < proximaRodada.length; i++) {
          await tx.copaConfronto.update({
            where: { id: rodadaAnterior[i * 2].id },
            data: { proximoConfrontoId: proximaRodada[i].id, proximoConfrontoSlot: "A" },
          });
          await tx.copaConfronto.update({
            where: { id: rodadaAnterior[i * 2 + 1].id },
            data: { proximoConfrontoId: proximaRodada[i].id, proximoConfrontoSlot: "B" },
          });
        }

        rodadaAnterior = proximaRodada;
      }
    },
    { timeout: 30000 }
  );
}

export interface FecharEtapaResultado {
  resolvidos: number;
  pendentes: number;
  erro?: string;
}

export async function fecharEtapa(etapaId: string): Promise<FecharEtapaResultado> {
  const etapa = await prisma.etapa.findUniqueOrThrow({
    where: { id: etapaId },
    include: { jogos: { where: { confrontoId: null } }, competicao: true },
  });

  const jogosSemResultado = etapa.jogos.some((j) => j.placarCasa == null);
  if (jogosSemResultado) {
    return { resolvidos: 0, pendentes: 0, erro: "Ainda há jogos sem resultado lançado nesta etapa" };
  }

  const confrontos = await prisma.copaConfronto.findMany({
    where: { etapaId },
    include: { participanteA: true, participanteB: true },
  });

  let resolvidos = 0;
  let pendentes = 0;

  for (const confronto of confrontos) {
    if (confronto.vencedorId) continue;
    if (!confronto.participanteAId || !confronto.participanteBId || !confronto.participanteA || !confronto.participanteB) {
      continue;
    }

    const [pontosA, pontosB] = await Promise.all([
      pontosConfronto(confronto.id, confronto.participanteA.usuarioId),
      pontosConfronto(confronto.id, confronto.participanteB.usuarioId),
    ]);

    let vencedorId: string;

    if (pontosA !== pontosB) {
      vencedorId = pontosA > pontosB ? confronto.participanteAId : confronto.participanteBId;
    } else {
      const resultado = await aplicarCriterioDesempate(
        {
          id: confronto.id,
          etapaId: confronto.etapaId,
          participanteAId: confronto.participanteAId,
          participanteBId: confronto.participanteBId,
          usuarioIdA: confronto.participanteA.usuarioId,
          usuarioIdB: confronto.participanteB.usuarioId,
        },
        etapa.competicao.criterioDesempate ?? "SORTEIO_DIRETO"
      );
      if (resultado === "INDEFINIDO") {
        pendentes++;
        continue;
      }
      vencedorId = resultado;
    }

    const perdedorId = vencedorId === confronto.participanteAId ? confronto.participanteBId : confronto.participanteAId;

    await prisma.$transaction([
      prisma.copaConfronto.update({ where: { id: confronto.id }, data: { vencedorId } }),
      prisma.copaParticipante.update({ where: { id: perdedorId }, data: { ativo: false } }),
    ]);

    if (confronto.proximoConfrontoId && confronto.proximoConfrontoSlot) {
      await prisma.copaConfronto.update({
        where: { id: confronto.proximoConfrontoId },
        data:
          confronto.proximoConfrontoSlot === "A" ? { participanteAId: vencedorId } : { participanteBId: vencedorId },
      });
    } else if (!confronto.proximoConfrontoId) {
      const vencedor = await prisma.copaParticipante.findUniqueOrThrow({ where: { id: vencedorId } });
      await prisma.competicao.update({
        where: { id: etapa.competicaoId },
        data: { campeaoUsuarioId: vencedor.usuarioId, status: "ENCERRADA" },
      });
    }

    resolvidos++;
  }

  const todosResolvidos = await prisma.copaConfronto.count({
    where: { etapaId, vencedorId: null, participanteAId: { not: null }, participanteBId: { not: null } },
  });

  if (todosResolvidos === 0 && pendentes === 0) {
    await prisma.etapa.update({ where: { id: etapaId }, data: { status: "FECHADA" } });
  }

  return { resolvidos, pendentes };
}

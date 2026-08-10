import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";
import { calcularResultadoPalpite } from "@/lib/scoring/calcularResultadoPalpite";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const prisma = new PrismaClient({ adapter });

const TEMPORADA_ID = "cmsjixuy60002bcut8xy9lut0"; // Claude Code / 1° Temporada
const LIGA_ETAPA_ID = "cmsjj3q0k0004bcutqlior54n"; // Liga Claude / Rodada 1
const COPA_ETAPA_ID = "cmsjk09ka000ubcutdlyxqxr0"; // Copa Claude / Quartas de Final

function ontem() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
}

async function main() {
  const participantes = await prisma.temporadaParticipante.findMany({
    where: { temporadaId: TEMPORADA_ID, status: "APROVADO" },
    include: { usuario: true },
  });
  console.log(
    `Participantes aprovados na temporada: ${participantes.map((p) => p.usuario.nome).join(", ")}`
  );

  // --- Liga: Rodada 1 (3 jogos compartilhados) ---
  const jogosLiga = await prisma.jogo.findMany({
    where: { etapaId: LIGA_ETAPA_ID },
    include: { timeCasa: true, timeVisitante: true, etapa: { include: { competicao: true } } },
  });

  const resultadosFake = [
    { placarCasa: 2, placarVisitante: 1 },
    { placarCasa: 0, placarVisitante: 3 },
    { placarCasa: 1, placarVisitante: 1 },
  ];

  for (let i = 0; i < jogosLiga.length; i++) {
    const jogo = jogosLiga[i];
    const resultado = resultadosFake[i % resultadosFake.length];

    await prisma.jogo.update({
      where: { id: jogo.id },
      data: { dataHora: ontem(), placarCasa: resultado.placarCasa, placarVisitante: resultado.placarVisitante },
    });

    for (let p = 0; p < participantes.length; p++) {
      const usuario = participantes[p].usuario;
      // varia os palpites: alguns cravam, outros acertam o resultado, outros erram
      const variacao = (p + i) % 3;
      let palpiteCasa = resultado.placarCasa;
      let palpiteVisitante = resultado.placarVisitante;
      if (variacao === 1) {
        palpiteCasa = resultado.placarCasa + 1;
        palpiteVisitante = Math.max(0, resultado.placarVisitante - 1);
      } else if (variacao === 2) {
        palpiteCasa = resultado.placarVisitante;
        palpiteVisitante = resultado.placarCasa;
      }

      const { tipo, pontos } = calcularResultadoPalpite(
        { casa: palpiteCasa, visitante: palpiteVisitante },
        { casa: resultado.placarCasa, visitante: resultado.placarVisitante },
        { pontosCravada: jogo.etapa.competicao.pontosCravada, pontosAcerto: jogo.etapa.competicao.pontosAcerto }
      );

      await prisma.palpite.upsert({
        where: { jogoId_usuarioId: { jogoId: jogo.id, usuarioId: usuario.id } },
        create: {
          jogoId: jogo.id,
          usuarioId: usuario.id,
          placarCasa: palpiteCasa,
          placarVisitante: palpiteVisitante,
          tipoResultado: tipo,
          pontos,
        },
        update: { placarCasa: palpiteCasa, placarVisitante: palpiteVisitante, tipoResultado: tipo, pontos },
      });
    }
    console.log(
      `Liga: ${jogo.timeCasa.nome} ${resultado.placarCasa}x${resultado.placarVisitante} ${jogo.timeVisitante.nome} — ${participantes.length} palpites`
    );
  }

  // --- Copa: cria um jogo real compartilhado na Quartas de Final (se ainda não existir) ---
  const copaEtapa = await prisma.etapa.findUniqueOrThrow({
    where: { id: COPA_ETAPA_ID },
    include: { competicao: true, jogos: { where: { confrontoId: null } } },
  });

  const times = await prisma.time.findMany({ where: { saveId: (await prisma.save.findFirstOrThrow({ where: { temporadas: { some: { id: TEMPORADA_ID } } } })).id } });
  const timeCasa = times.find((t) => t.nome === "Flamengo") ?? times[0];
  const timeVisitante = times.find((t) => t.nome === "Vasco") ?? times[1];

  let jogoCopa = copaEtapa.jogos[0];
  if (!jogoCopa) {
    jogoCopa = await prisma.jogo.create({
      data: {
        etapaId: COPA_ETAPA_ID,
        timeCasaId: timeCasa.id,
        timeVisitanteId: timeVisitante.id,
        dataHora: ontem(),
        placarCasa: 3,
        placarVisitante: 2,
      },
    });
  } else {
    jogoCopa = await prisma.jogo.update({
      where: { id: jogoCopa.id },
      data: { dataHora: ontem(), placarCasa: 3, placarVisitante: 2 },
    });
  }

  // pega os 8 participantes do confronto (Quartas de Final) pra gerar palpites deles
  const copaParticipantes = await prisma.copaParticipante.findMany({
    where: { competicaoId: copaEtapa.competicaoId },
    include: { usuario: true },
  });

  for (let p = 0; p < copaParticipantes.length; p++) {
    const usuario = copaParticipantes[p].usuario;
    const variacao = p % 3;
    let palpiteCasa = 3;
    let palpiteVisitante = 2;
    if (variacao === 1) {
      palpiteCasa = 2;
      palpiteVisitante = 2;
    } else if (variacao === 2) {
      palpiteCasa = 1;
      palpiteVisitante = 3;
    }

    const { tipo, pontos } = calcularResultadoPalpite(
      { casa: palpiteCasa, visitante: palpiteVisitante },
      { casa: 3, visitante: 2 },
      { pontosCravada: copaEtapa.competicao.pontosCravada, pontosAcerto: copaEtapa.competicao.pontosAcerto }
    );

    await prisma.palpite.upsert({
      where: { jogoId_usuarioId: { jogoId: jogoCopa.id, usuarioId: usuario.id } },
      create: {
        jogoId: jogoCopa.id,
        usuarioId: usuario.id,
        placarCasa: palpiteCasa,
        placarVisitante: palpiteVisitante,
        tipoResultado: tipo,
        pontos,
      },
      update: { placarCasa: palpiteCasa, placarVisitante: palpiteVisitante, tipoResultado: tipo, pontos },
    });
  }
  console.log(`Copa: jogo ${timeCasa.nome} 3x2 ${timeVisitante.nome} — ${copaParticipantes.length} palpites`);

  console.log("\nPronto! Acesse a Divulgação de Palpites da Liga Claude e o confronto da Copa Claude.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

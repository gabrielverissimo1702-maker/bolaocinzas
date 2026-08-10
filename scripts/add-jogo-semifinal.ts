import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const prisma = new PrismaClient({ adapter });

async function main() {
  const copa = await prisma.competicao.findFirstOrThrow({ where: { nome: "Copa Claude" } });
  const semifinal = await prisma.etapa.findFirstOrThrow({ where: { competicaoId: copa.id, nome: "Semifinal" } });
  const times = await prisma.time.findMany({
    where: { save: { temporadas: { some: { competicoes: { some: { id: copa.id } } } } } },
  });
  const casa = times.find((t) => t.nome === "Corinthians") ?? times[0];
  const fora = times.find((t) => t.nome === "Bahia") ?? times[1];

  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);

  const jogo = await prisma.jogo.create({
    data: {
      etapaId: semifinal.id,
      timeCasaId: casa.id,
      timeVisitanteId: fora.id,
      dataHora: amanha,
    },
  });
  console.log(`Jogo criado na Semifinal: ${casa.nome} x ${fora.nome} em ${jogo.dataHora.toISOString()}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

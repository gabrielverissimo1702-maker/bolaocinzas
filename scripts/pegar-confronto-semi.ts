import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const prisma = new PrismaClient({ adapter });

async function main() {
  const copa = await prisma.competicao.findFirstOrThrow({ where: { nome: "Copa Claude" } });
  const semifinal = await prisma.etapa.findFirstOrThrow({ where: { competicaoId: copa.id, nome: "Semifinal" } });
  const confrontos = await prisma.copaConfronto.findMany({
    where: { etapaId: semifinal.id },
    include: { participanteA: { include: { usuario: true } }, participanteB: { include: { usuario: true } } },
  });
  for (const c of confrontos) {
    console.log(`${c.id}: ${c.participanteA?.usuario.nome ?? "-"} vs ${c.participanteB?.usuario.nome ?? "-"}`);
  }
  console.log("competicaoId:", copa.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

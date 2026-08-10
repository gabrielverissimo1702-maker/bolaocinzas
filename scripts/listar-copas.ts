import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const comps = await prisma.competicao.findMany({
    where: { tipo: { in: ["COPA", "SUPERCOPA"] } },
    select: { id: true, nome: true, tipo: true, temporadaId: true },
  });
  console.log(JSON.stringify(comps, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

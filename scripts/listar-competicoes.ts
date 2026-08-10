import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const prisma = new PrismaClient({ adapter });

async function main() {
  const comps = await prisma.competicao.findMany({
    include: {
      temporada: { include: { save: true } },
      etapas: { include: { jogos: { include: { timeCasa: true, timeVisitante: true } } } },
    },
  });
  for (const c of comps) {
    console.log(`\n=== ${c.tipo} "${c.nome}" (${c.id}) — save "${c.temporada.save.nome}" / temporada "${c.temporada.nome}" ===`);
    for (const e of c.etapas) {
      console.log(`  Etapa: ${e.nome} (${e.id}) [${e.status}]`);
      for (const j of e.jogos) {
        console.log(
          `    Jogo ${j.id}: ${j.timeCasa.nome} x ${j.timeVisitante.nome} — ${j.dataHora.toISOString()} — placar: ${j.placarCasa ?? "-"}x${j.placarVisitante ?? "-"}`
        );
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

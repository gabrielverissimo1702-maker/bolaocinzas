import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const prisma = new PrismaClient({ adapter });

async function main() {
  const carla = await prisma.usuario.findUniqueOrThrow({ where: { email: "carla.souza@example.com" } });
  const copa = await prisma.competicao.findFirstOrThrow({ where: { nome: "Copa Claude" } });

  const participante = await prisma.copaParticipante.findUnique({
    where: { competicaoId_usuarioId: { competicaoId: copa.id, usuarioId: carla.id } },
  });
  console.log("CopaParticipante da Carla:", participante);

  const confrontos = await prisma.copaConfronto.findMany({
    where: { etapa: { competicaoId: copa.id } },
    include: {
      etapa: true,
      participanteA: { include: { usuario: true } },
      participanteB: { include: { usuario: true } },
    },
    orderBy: [{ etapa: { ordem: "asc" } }, { ordem: "asc" }],
  });
  for (const c of confrontos) {
    console.log(
      `Etapa ${c.etapa.nome} [${c.etapa.status}]: ${c.participanteA?.usuario.nome ?? "-"} vs ${c.participanteB?.usuario.nome ?? "-"} — vencedor: ${c.vencedorId ?? "-"}`
    );
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

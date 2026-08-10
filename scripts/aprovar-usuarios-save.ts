import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

const CODIGO = "KGCST4";

const EMAILS = [
  "bruno.silva@example.com",
  "carla.souza@example.com",
  "diego.santos@example.com",
  "fernanda.lima@example.com",
  "lucas.oliveira@example.com",
  "patricia.alves@example.com",
  "rodrigo.costa@example.com",
  "juliana.rocha@example.com",
];

async function main() {
  const save = await prisma.save.findUnique({ where: { codigoAcesso: CODIGO } });
  if (!save) {
    console.error(`Save com código ${CODIGO} não encontrado`);
    process.exitCode = 1;
    return;
  }
  console.log(`Save: ${save.nome} (${save.id})`);

  const temporadas = await prisma.temporada.findMany({ where: { saveId: save.id } });
  if (temporadas.length === 0) {
    console.error("Este save ainda não tem nenhuma temporada.");
    process.exitCode = 1;
    return;
  }

  const usuarios = await prisma.usuario.findMany({ where: { email: { in: EMAILS } } });
  console.log(`Usuários encontrados: ${usuarios.length}/${EMAILS.length}`);

  for (const temporada of temporadas) {
    console.log(`\nTemporada: ${temporada.nome} (${temporada.id})`);
    for (const u of usuarios) {
      await prisma.temporadaParticipante.upsert({
        where: { temporadaId_usuarioId: { temporadaId: temporada.id, usuarioId: u.id } },
        update: { status: "APROVADO", decididoEm: new Date() },
        create: {
          temporadaId: temporada.id,
          usuarioId: u.id,
          status: "APROVADO",
          decididoEm: new Date(),
        },
      });
      console.log(`  + ${u.nome} aprovado`);
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

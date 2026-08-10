import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";
import { hashPassword } from "@/lib/auth/password";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

const SENHA = "senha12345";

const usuarios = [
  { nome: "Bruno Silva", email: "bruno.silva@example.com", sigla: "BRU", cores: ["#2563eb", "#ffffff"], padraoUniforme: "LISTRAS_VERTICAIS" as const },
  { nome: "Carla Souza", email: "carla.souza@example.com", sigla: "CAR", cores: ["#db2777"], padraoUniforme: "SOLIDO" as const },
  { nome: "Diego Santos", email: "diego.santos@example.com", sigla: "DIE", cores: ["#f59e0b", "#1b1b1b"], padraoUniforme: "LISTRAS_HORIZONTAIS" as const },
  { nome: "Fernanda Lima", email: "fernanda.lima@example.com", sigla: "FER", cores: ["#059669"], padraoUniforme: "SOLIDO" as const },
  { nome: "Lucas Oliveira", email: "lucas.oliveira@example.com", sigla: "LUC", cores: ["#7c3aed", "#ffffff", "#1b1b1b"], padraoUniforme: "LISTRAS_DIAGONAIS" as const },
  { nome: "Patrícia Alves", email: "patricia.alves@example.com", sigla: "PAT", cores: ["#dc2626", "#f8fafc"], padraoUniforme: "LISTRAS_VERTICAIS" as const },
  { nome: "Rodrigo Costa", email: "rodrigo.costa@example.com", sigla: "ROD", cores: ["#0891b2"], padraoUniforme: "SOLIDO" as const },
  { nome: "Juliana Rocha", email: "juliana.rocha@example.com", sigla: "JUL", cores: ["#65a30d", "#facc15"], padraoUniforme: "LISTRAS_HORIZONTAIS" as const },
];

async function main() {
  const senhaHash = await hashPassword(SENHA);

  for (const u of usuarios) {
    const existente = await prisma.usuario.findUnique({ where: { email: u.email } });
    if (existente) {
      console.log(`- ${u.email} já existe, pulando`);
      continue;
    }
    await prisma.usuario.create({
      data: { ...u, senhaHash },
    });
    console.log(`+ criado ${u.nome} <${u.email}>`);
  }

  console.log(`\nSenha de todos: ${SENHA}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

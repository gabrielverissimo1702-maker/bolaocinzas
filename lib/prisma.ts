import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  // O pooler (Supavisor) do Supabase apresenta uma cadeia de certificado que a
  // store de CAs padrão do Node não reconhece; a conexão já é criptografada (TLS),
  // apenas não validamos a cadeia contra uma CA raiz conhecida.
  ssl: { rejectUnauthorized: false },
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

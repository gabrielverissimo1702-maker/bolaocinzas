-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tokenVerificacao" TEXT,
ADD COLUMN     "tokenVerificacaoExpiraEm" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_tokenVerificacao_key" ON "Usuario"("tokenVerificacao");

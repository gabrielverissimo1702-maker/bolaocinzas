-- AlterEnum
ALTER TYPE "CompeticaoStatus" ADD VALUE 'RASCUNHO';

-- AlterTable
ALTER TABLE "Competicao" ALTER COLUMN "status" SET DEFAULT 'RASCUNHO';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PadraoUniforme" ADD VALUE 'MANGAS_CONTRASTANTES';
ALTER TYPE "PadraoUniforme" ADD VALUE 'GOLA_CONTRASTANTE';
ALTER TYPE "PadraoUniforme" ADD VALUE 'BICOLOR';
ALTER TYPE "PadraoUniforme" ADD VALUE 'DEGRADE';

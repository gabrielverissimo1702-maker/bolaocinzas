-- CreateEnum
CREATE TYPE "PadraoUniforme" AS ENUM ('SOLIDO', 'LISTRAS_VERTICAIS', 'LISTRAS_HORIZONTAIS', 'LISTRAS_DIAGONAIS');

-- AlterTable: add nullable first so existing rows don't break
ALTER TABLE "Time" ADD COLUMN "sigla" TEXT;
ALTER TABLE "Time" ADD COLUMN "corPrimaria" TEXT;
ALTER TABLE "Time" ADD COLUMN "corSecundaria" TEXT;
ALTER TABLE "Time" ADD COLUMN "padraoUniforme" "PadraoUniforme" NOT NULL DEFAULT 'SOLIDO';

-- Backfill existing rows with reasonable defaults
UPDATE "Time" SET "sigla" = UPPER(LEFT(REGEXP_REPLACE(nome, '[^A-Za-z]', '', 'g'), 4)), "corPrimaria" = '#6B7280' WHERE "sigla" IS NULL;

-- Now enforce NOT NULL
ALTER TABLE "Time" ALTER COLUMN "sigla" SET NOT NULL;
ALTER TABLE "Time" ALTER COLUMN "corPrimaria" SET NOT NULL;

-- Drop the old escudoUrl column (replaced by generated uniforme)
ALTER TABLE "Time" DROP COLUMN "escudoUrl";

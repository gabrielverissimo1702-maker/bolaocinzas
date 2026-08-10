-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "sigla" TEXT NOT NULL DEFAULT 'USR';
ALTER TABLE "Usuario" ADD COLUMN "cores" TEXT[] NOT NULL DEFAULT ARRAY['#6B7280']::TEXT[];
ALTER TABLE "Usuario" ADD COLUMN "padraoUniforme" "PadraoUniforme" NOT NULL DEFAULT 'SOLIDO';

-- Backfill: derive a sigla from the user's name for existing rows
UPDATE "Usuario" SET "sigla" = UPPER(LEFT(REGEXP_REPLACE(nome, '[^A-Za-z]', '', 'g'), 4)) WHERE "sigla" = 'USR';
UPDATE "Usuario" SET "sigla" = 'USR' WHERE "sigla" = '' OR "sigla" IS NULL;

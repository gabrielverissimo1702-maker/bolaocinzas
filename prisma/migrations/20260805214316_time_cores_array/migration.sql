-- AlterTable: substitui corPrimaria/corSecundaria por um array de cores (1 a 4)
ALTER TABLE "Time" ADD COLUMN "cores" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "Time"
SET "cores" = CASE
  WHEN "corSecundaria" IS NOT NULL THEN ARRAY["corPrimaria", "corSecundaria"]
  ELSE ARRAY["corPrimaria"]
END;

ALTER TABLE "Time" ALTER COLUMN "cores" DROP DEFAULT;
ALTER TABLE "Time" DROP COLUMN "corPrimaria";
ALTER TABLE "Time" DROP COLUMN "corSecundaria";

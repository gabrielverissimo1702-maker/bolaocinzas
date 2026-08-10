-- Marca como verificados os usuários criados antes da feature de verificação de
-- email existir, evitando que fiquem trancados fora do login. Novos cadastros
-- continuam entrando com emailVerificado = false (valor padrão da coluna).
UPDATE "Usuario" SET "emailVerificado" = true WHERE "tokenVerificacao" IS NULL;

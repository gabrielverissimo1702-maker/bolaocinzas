-- Apaga tudo que estiver no schema "public" (suas tabelas customizadas) e recria vazio.
-- Não afeta os schemas internos do Supabase (auth, storage, etc.).
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

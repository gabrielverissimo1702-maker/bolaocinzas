-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "CompeticaoTipo" AS ENUM ('LIGA', 'COPA', 'SUPERCOPA');

-- CreateEnum
CREATE TYPE "CompeticaoStatus" AS ENUM ('EM_ANDAMENTO', 'ENCERRADA');

-- CreateEnum
CREATE TYPE "EtapaStatus" AS ENUM ('ABERTA', 'FECHADA');

-- CreateEnum
CREATE TYPE "TemporadaStatus" AS ENUM ('ABERTA', 'FECHADA');

-- CreateEnum
CREATE TYPE "ParticipacaoStatus" AS ENUM ('PENDENTE', 'APROVADO', 'REJEITADO', 'REMOVIDO');

-- CreateEnum
CREATE TYPE "ResultadoTipo" AS ENUM ('PENDENTE', 'CRAVADA', 'ACERTO_PARCIAL', 'ERRO');

-- CreateEnum
CREATE TYPE "CriterioDesempate" AS ENUM ('JOGO_EXTRA', 'MAIS_CRAVADAS', 'MAIS_ACERTOS', 'SORTEIO_DIRETO');

-- CreateEnum
CREATE TYPE "FormaGeracaoConfrontos" AS ENUM ('SORTEIO', 'MANUAL', 'HIBRIDO');

-- CreateEnum
CREATE TYPE "ConfrontoSlot" AS ENUM ('A', 'B');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sessao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sessao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Save" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigoAcesso" TEXT NOT NULL,
    "criadorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Save_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Temporada" (
    "id" TEXT NOT NULL,
    "saveId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "status" "TemporadaStatus" NOT NULL DEFAULT 'ABERTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Temporada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemporadaParticipante" (
    "id" TEXT NOT NULL,
    "temporadaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "status" "ParticipacaoStatus" NOT NULL DEFAULT 'PENDENTE',
    "solicitadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decididoEm" TIMESTAMP(3),

    CONSTRAINT "TemporadaParticipante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Time" (
    "id" TEXT NOT NULL,
    "saveId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "escudoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Time_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competicao" (
    "id" TEXT NOT NULL,
    "temporadaId" TEXT NOT NULL,
    "tipo" "CompeticaoTipo" NOT NULL,
    "nome" TEXT NOT NULL,
    "status" "CompeticaoStatus" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "pontosCravada" INTEGER NOT NULL,
    "pontosAcerto" INTEGER NOT NULL,
    "criterioDesempate" "CriterioDesempate",
    "numeroRodadas" INTEGER,
    "jogosPorRodada" INTEGER,
    "numeroParticipantes" INTEGER,
    "jogosPorFase" INTEGER,
    "formaGeracaoConfrontos" "FormaGeracaoConfrontos",
    "numeroJogos" INTEGER,
    "campeaoUsuarioId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Competicao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Etapa" (
    "id" TEXT NOT NULL,
    "competicaoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "preliminar" BOOLEAN NOT NULL DEFAULT false,
    "status" "EtapaStatus" NOT NULL DEFAULT 'ABERTA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Etapa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Jogo" (
    "id" TEXT NOT NULL,
    "etapaId" TEXT NOT NULL,
    "confrontoId" TEXT,
    "timeCasaId" TEXT NOT NULL,
    "timeVisitanteId" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "placarCasa" INTEGER,
    "placarVisitante" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Jogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Palpite" (
    "id" TEXT NOT NULL,
    "jogoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "placarCasa" INTEGER NOT NULL,
    "placarVisitante" INTEGER NOT NULL,
    "tipoResultado" "ResultadoTipo" NOT NULL DEFAULT 'PENDENTE',
    "pontos" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Palpite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CopaParticipante" (
    "id" TEXT NOT NULL,
    "competicaoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "seed" INTEGER,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CopaParticipante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CopaConfronto" (
    "id" TEXT NOT NULL,
    "etapaId" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "participanteAId" TEXT,
    "participanteBId" TEXT,
    "vencedorId" TEXT,
    "proximoConfrontoId" TEXT,
    "proximoConfrontoSlot" "ConfrontoSlot",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CopaConfronto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_email_idx" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Sessao_usuarioId_idx" ON "Sessao"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Save_codigoAcesso_key" ON "Save"("codigoAcesso");

-- CreateIndex
CREATE INDEX "Temporada_saveId_idx" ON "Temporada"("saveId");

-- CreateIndex
CREATE INDEX "TemporadaParticipante_usuarioId_idx" ON "TemporadaParticipante"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "TemporadaParticipante_temporadaId_usuarioId_key" ON "TemporadaParticipante"("temporadaId", "usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Time_saveId_nome_key" ON "Time"("saveId", "nome");

-- CreateIndex
CREATE INDEX "Competicao_temporadaId_idx" ON "Competicao"("temporadaId");

-- CreateIndex
CREATE UNIQUE INDEX "Etapa_competicaoId_ordem_key" ON "Etapa"("competicaoId", "ordem");

-- CreateIndex
CREATE INDEX "Jogo_etapaId_idx" ON "Jogo"("etapaId");

-- CreateIndex
CREATE INDEX "Palpite_usuarioId_idx" ON "Palpite"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Palpite_jogoId_usuarioId_key" ON "Palpite"("jogoId", "usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "CopaParticipante_competicaoId_usuarioId_key" ON "CopaParticipante"("competicaoId", "usuarioId");

-- CreateIndex
CREATE INDEX "CopaConfronto_proximoConfrontoId_idx" ON "CopaConfronto"("proximoConfrontoId");

-- CreateIndex
CREATE UNIQUE INDEX "CopaConfronto_etapaId_ordem_key" ON "CopaConfronto"("etapaId", "ordem");

-- AddForeignKey
ALTER TABLE "Sessao" ADD CONSTRAINT "Sessao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Save" ADD CONSTRAINT "Save_criadorId_fkey" FOREIGN KEY ("criadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Temporada" ADD CONSTRAINT "Temporada_saveId_fkey" FOREIGN KEY ("saveId") REFERENCES "Save"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemporadaParticipante" ADD CONSTRAINT "TemporadaParticipante_temporadaId_fkey" FOREIGN KEY ("temporadaId") REFERENCES "Temporada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemporadaParticipante" ADD CONSTRAINT "TemporadaParticipante_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Time" ADD CONSTRAINT "Time_saveId_fkey" FOREIGN KEY ("saveId") REFERENCES "Save"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competicao" ADD CONSTRAINT "Competicao_temporadaId_fkey" FOREIGN KEY ("temporadaId") REFERENCES "Temporada"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competicao" ADD CONSTRAINT "Competicao_campeaoUsuarioId_fkey" FOREIGN KEY ("campeaoUsuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etapa" ADD CONSTRAINT "Etapa_competicaoId_fkey" FOREIGN KEY ("competicaoId") REFERENCES "Competicao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jogo" ADD CONSTRAINT "Jogo_etapaId_fkey" FOREIGN KEY ("etapaId") REFERENCES "Etapa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jogo" ADD CONSTRAINT "Jogo_confrontoId_fkey" FOREIGN KEY ("confrontoId") REFERENCES "CopaConfronto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jogo" ADD CONSTRAINT "Jogo_timeCasaId_fkey" FOREIGN KEY ("timeCasaId") REFERENCES "Time"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jogo" ADD CONSTRAINT "Jogo_timeVisitanteId_fkey" FOREIGN KEY ("timeVisitanteId") REFERENCES "Time"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Palpite" ADD CONSTRAINT "Palpite_jogoId_fkey" FOREIGN KEY ("jogoId") REFERENCES "Jogo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Palpite" ADD CONSTRAINT "Palpite_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopaParticipante" ADD CONSTRAINT "CopaParticipante_competicaoId_fkey" FOREIGN KEY ("competicaoId") REFERENCES "Competicao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopaParticipante" ADD CONSTRAINT "CopaParticipante_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopaConfronto" ADD CONSTRAINT "CopaConfronto_etapaId_fkey" FOREIGN KEY ("etapaId") REFERENCES "Etapa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopaConfronto" ADD CONSTRAINT "CopaConfronto_participanteAId_fkey" FOREIGN KEY ("participanteAId") REFERENCES "CopaParticipante"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopaConfronto" ADD CONSTRAINT "CopaConfronto_participanteBId_fkey" FOREIGN KEY ("participanteBId") REFERENCES "CopaParticipante"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopaConfronto" ADD CONSTRAINT "CopaConfronto_vencedorId_fkey" FOREIGN KEY ("vencedorId") REFERENCES "CopaParticipante"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CopaConfronto" ADD CONSTRAINT "CopaConfronto_proximoConfrontoId_fkey" FOREIGN KEY ("proximoConfrontoId") REFERENCES "CopaConfronto"("id") ON DELETE SET NULL ON UPDATE CASCADE;


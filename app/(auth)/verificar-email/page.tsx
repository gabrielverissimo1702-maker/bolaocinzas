import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function VerificarEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <Resultado sucesso={false} mensagem="Link de verificação inválido." />;
  }

  const usuario = await prisma.usuario.findUnique({ where: { tokenVerificacao: token } });

  if (!usuario) {
    return <Resultado sucesso={false} mensagem="Link de verificação inválido ou já utilizado." />;
  }

  if (!usuario.tokenVerificacaoExpiraEm || usuario.tokenVerificacaoExpiraEm < new Date()) {
    return (
      <Resultado
        sucesso={false}
        mensagem="Este link expirou. Peça um novo email de verificação na tela de login."
      />
    );
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { emailVerificado: true, tokenVerificacao: null, tokenVerificacaoExpiraEm: null },
  });

  redirect("/login?verificado=1");
}

function Resultado({ sucesso, mensagem }: { sucesso: boolean; mensagem: string }) {
  return (
    <div className="text-center">
      <h1 className="mb-3 text-xl font-bold text-slate-900 dark:text-slate-50">
        {sucesso ? "Email confirmado" : "Não foi possível confirmar"}
      </h1>
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">{mensagem}</p>
      <Link
        href="/login"
        className="inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:text-slate-950"
      >
        Ir para o login
      </Link>
    </div>
  );
}

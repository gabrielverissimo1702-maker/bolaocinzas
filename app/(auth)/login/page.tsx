"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { entrar, reenviarVerificacaoEmail, type AuthActionState, type ReenviarVerificacaoState } from "@/app/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: AuthActionState = {};
const initialReenvioState: ReenviarVerificacaoState = {};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const verificado = searchParams.get("verificado") === "1";

  const [state, formAction, pending] = useActionState(entrar, initialState);
  const [reenvioState, reenvioAction, reenvioPending] = useActionState(
    reenviarVerificacaoEmail,
    initialReenvioState
  );

  return (
    <>
      <h1 className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-50">Entrar</h1>

      {verificado && (
        <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
          Email confirmado! Já pode entrar.
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-4">
        <Input id="email" name="email" type="email" label="Email" required />
        <Input id="senha" name="senha" type="password" label="Senha" required />

        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

        <Button type="submit" disabled={pending} className="mt-2 w-full">
          {pending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      {state.emailNaoVerificado && (
        <form action={reenvioAction} className="mt-3">
          <input type="hidden" name="email" value={state.email} />
          {reenvioState.success ? (
            <p className="text-center text-sm text-emerald-600 dark:text-emerald-400">
              Se o email existir, um novo link foi enviado.
            </p>
          ) : (
            <Button type="submit" variant="outline" disabled={reenvioPending} className="w-full">
              {reenvioPending ? "Enviando..." : "Reenviar email de confirmação"}
            </Button>
          )}
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          Cadastre-se
        </Link>
      </p>
    </>
  );
}

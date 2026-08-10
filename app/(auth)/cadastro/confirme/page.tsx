"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { reenviarVerificacaoEmail, type ReenviarVerificacaoState } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";

const initialState: ReenviarVerificacaoState = {};

export default function ConfirmeEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [state, formAction, pending] = useActionState(reenviarVerificacaoEmail, initialState);

  return (
    <div className="text-center">
      <h1 className="mb-3 text-xl font-bold text-slate-900 dark:text-slate-50">Confira seu email</h1>
      <p className="mb-1 text-sm text-slate-600 dark:text-slate-400">
        Enviamos um link de confirmação para
      </p>
      <p className="mb-6 text-sm font-semibold text-slate-900 dark:text-slate-100">{email}</p>
      <p className="mb-6 text-xs text-slate-500 dark:text-slate-500">
        Clique no link do email para liberar seu acesso. Não esqueça de checar o spam.
      </p>

      <form action={formAction}>
        <input type="hidden" name="email" value={email} />
        {state.success && (
          <p className="mb-3 text-sm text-emerald-600 dark:text-emerald-400">
            Se o email existir, um novo link foi enviado.
          </p>
        )}
        <Button type="submit" variant="outline" disabled={pending} className="w-full">
          {pending ? "Enviando..." : "Reenviar email"}
        </Button>
      </form>
    </div>
  );
}

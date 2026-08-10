"use client";

import { useActionState } from "react";
import Link from "next/link";
import { entrar, type AuthActionState } from "@/app/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: AuthActionState = {};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(entrar, initialState);

  return (
    <>
      <h1 className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-50">Entrar</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <Input id="email" name="email" type="email" label="Email" required />
        <Input id="senha" name="senha" type="password" label="Senha" required />

        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

        <Button type="submit" disabled={pending} className="mt-2 w-full">
          {pending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          Cadastre-se
        </Link>
      </p>
    </>
  );
}


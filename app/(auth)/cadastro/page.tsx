"use client";

import { useActionState } from "react";
import Link from "next/link";
import { cadastrar, type AuthActionState } from "@/app/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UniformePicker } from "@/components/UniformePicker";

const initialState: AuthActionState = {};

export default function CadastroPage() {
  const [state, formAction, pending] = useActionState(cadastrar, initialState);

  return (
    <>
      <h1 className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-50">Criar conta</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <Input id="nome" name="nome" type="text" label="Nome" required />
        <Input id="email" name="email" type="email" label="Email" required />
        <Input id="senha" name="senha" type="password" label="Senha" required minLength={6} />

        <UniformePicker siglaLabel="Sua sigla" siglaPlaceholder="ex: GAB" />

        {state.error && <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>}

        <Button type="submit" disabled={pending} className="mt-2 w-full">
          {pending ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-emerald-600 hover:underline dark:text-emerald-400">
          Entrar
        </Link>
      </p>
    </>
  );
}

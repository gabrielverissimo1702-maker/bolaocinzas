import { redirect } from "next/navigation";
import { getUsuarioAtual } from "@/lib/auth/session";
import { sair } from "@/app/actions/auth";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/ui/Logo";
import { IconLogOut } from "@/components/ui/icons";
import { ModoProvider } from "@/lib/ModoContext";
import { CinzadosScene } from "@/components/CinzadosScene";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const usuario = await getUsuarioAtual();
  if (!usuario) redirect("/login");

  return (
    <ModoProvider>
      <div className="dark relative isolate min-h-dvh bg-[#050914]">
        <CinzadosScene />
        <div className="pointer-events-none fixed inset-0 z-0 bg-slate-950/72 sm:bg-slate-950/58" />
        <div className="relative z-10 flex min-h-dvh">
          <div className="hidden md:flex">
            <Sidebar nome={usuario.nome} />
          </div>

          <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
            <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/85 px-4 py-3 backdrop-blur-md md:hidden">
              <Logo />
              <form action={sair}>
                <button
                  type="submit"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800"
                >
                  <IconLogOut className="h-4 w-4" />
                </button>
              </form>
            </header>

            <main className="min-w-0 flex-1 px-4 py-8 pb-24 sm:px-8 md:pb-8">{children}</main>

            <div className="md:hidden">
              <BottomNav />
            </div>
          </div>
        </div>
      </div>
    </ModoProvider>
  );
}




import { Logo } from "@/components/ui/Logo";
import { CinzadosScene } from "@/components/CinzadosScene";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark relative isolate flex min-h-dvh w-full items-center justify-center overflow-hidden bg-[#050914] px-4">
      <CinzadosScene />
      <div className="pointer-events-none fixed inset-0 z-0 bg-slate-950/65 sm:bg-slate-950/50" />
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-xl border border-slate-700/80 bg-slate-900/90 p-6 sm:p-8 shadow-2xl shadow-black/30 backdrop-blur-md">
          {children}
        </div>
      </div>
    </div>
  );
}




import { UsuarioUniforme } from "@/components/UsuarioUniforme";
import type { LinhaClassificacao, RodadasInfo } from "@/lib/scoring/classificacaoLiga";

const RANK_BADGE: Record<number, string> = {
  1: "bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 shadow-[0_0_10px_rgba(251,191,36,0.5)]",
  2: "bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900",
  3: "bg-gradient-to-br from-orange-300 to-orange-500 text-orange-950",
};

export function ClassificacaoTabela({
  linhas,
  meuUsuarioId,
  rodadas,
}: {
  linhas: LinhaClassificacao[];
  meuUsuarioId?: string;
  rodadas?: RodadasInfo;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 shadow-lg shadow-black/30">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800 bg-black/20">
            <th className="w-12 px-3 py-3 text-left text-[10px] font-bold tracking-widest text-slate-500 uppercase">#</th>
            <th className="px-3 py-3 text-left text-[10px] font-bold tracking-widest text-slate-500 uppercase">Jogador</th>
            <th className="px-2 py-3 text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase">J</th>
            <th className="px-2 py-3 text-center text-[10px] font-bold tracking-widest text-emerald-500 uppercase">Pts</th>
            <th className="px-3 py-3 text-center text-[10px] font-bold tracking-widest text-amber-500 uppercase">Crv</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, i) => {
            const pos = i + 1;
            const souEu = linha.usuarioId === meuUsuarioId;
            return (
              <tr
                key={linha.usuarioId}
                className={`border-b border-slate-800/60 transition last:border-0 ${
                  souEu ? "bg-emerald-500/10" : "hover:bg-white/[0.02]"
                }`}
              >
                <td className={`border-l-4 px-3 py-3 ${souEu ? "border-l-emerald-400" : "border-l-transparent"}`}>
                  {RANK_BADGE[pos] ? (
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold ${RANK_BADGE[pos]}`}
                    >
                      {pos}
                    </span>
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center text-xs font-bold text-slate-500">
                      {pos}
                    </span>
                  )}
                </td>
                <td className="min-w-0 px-3 py-3">
                  <UsuarioUniforme usuario={linha} size={26} className="min-w-0 text-slate-50" />
                </td>
                <td className="px-2 py-3 text-center text-xs font-semibold text-slate-400">
                  {rodadas ? rodadas.completas : "–"}
                </td>
                <td className="px-2 py-3 text-center text-base font-extrabold text-emerald-400">{linha.pontos}</td>
                <td className="px-3 py-3 text-center text-base font-extrabold text-amber-400">{linha.cravadas}</td>
              </tr>
            );
          })}
          {linhas.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                Nenhum participante ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

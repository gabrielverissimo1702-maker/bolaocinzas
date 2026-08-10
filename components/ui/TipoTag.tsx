export type TipoCompeticao = "LIGA" | "COPA" | "SUPERCOPA";

const ESTILOS: Record<TipoCompeticao, string> = {
  LIGA: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  COPA: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  SUPERCOPA: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
};

const LABEL: Record<TipoCompeticao, string> = {
  LIGA: "Liga",
  COPA: "Copa",
  SUPERCOPA: "Supercopa",
};

export function TipoTag({ tipo, className = "" }: { tipo: TipoCompeticao; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide uppercase ${ESTILOS[tipo]} ${className}`}
    >
      {LABEL[tipo]}
    </span>
  );
}

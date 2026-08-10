export function ProgressoCircular({
  enviados,
  total,
  size = 52,
}: {
  enviados: number;
  total: number;
  size?: number;
}) {
  const strokeWidth = 4;
  const raio = (size - strokeWidth) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const progresso = total > 0 ? Math.min(1, enviados / total) : 0;
  const offset = circunferencia * (1 - progresso);
  const completo = total > 0 && enviados === total;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={raio}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray="2 4"
          className="text-slate-600"
        />
        {progresso > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={raio}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circunferencia}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={completo ? "text-emerald-400" : "text-emerald-500/80"}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold text-slate-200">
          {enviados}/{total}
        </span>
      </div>
    </div>
  );
}

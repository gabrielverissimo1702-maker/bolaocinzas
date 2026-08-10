type Cor = "green" | "blue" | "purple" | "amber";

const styles: Record<Cor, { label: string; value: string; border: string }> = {
  green: {
    label: "text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-900/60",
  },
  blue: {
    label: "text-blue-600 dark:text-blue-400",
    value: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-900/60",
  },
  purple: {
    label: "text-purple-600 dark:text-purple-400",
    value: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-900/60",
  },
  amber: {
    label: "text-amber-600 dark:text-amber-400",
    value: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-900/60",
  },
};

export function StatBlock({
  label,
  value,
  cor = "green",
  className = "",
}: {
  label: string;
  value: string | number;
  cor?: Cor;
  className?: string;
}) {
  const s = styles[cor];
  return (
    <div
      className={`flex flex-1 flex-col items-center gap-1 rounded-xl border bg-white px-4 py-3 dark:bg-slate-900 ${s.border} ${className}`}
    >
      <span className={`text-[11px] font-bold tracking-wider uppercase ${s.label}`}>{label}</span>
      <span className={`text-2xl font-extrabold ${s.value}`}>{value}</span>
    </div>
  );
}

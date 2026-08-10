export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0">
        <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600 dark:text-emerald-500" />
        <path
          d="M16 8l5 3.6-1.9 5.9h-6.2L11 11.6 16 8z"
          fill="currentColor"
          className="text-emerald-600 dark:text-emerald-500"
        />
        <path d="M16 3v5M16 24v5M3 16h5M24 16h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-emerald-600 dark:text-emerald-500" />
      </svg>
      <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50">Bolão</span>
    </div>
  );
}

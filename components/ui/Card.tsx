import { type HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 dark:shadow-lg dark:shadow-black/30 ${className}`}
      {...props}
    />
  );
}

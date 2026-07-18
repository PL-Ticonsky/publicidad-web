import type { ReactNode } from "react";

export function Skeleton({ className = "" }: { className?: string }) { return <div className={`animate-pulse rounded-2xl bg-[#e7e1d7] ${className}`} aria-hidden="true" />; }

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="rounded-2xl border border-[var(--color-border-default)] bg-white px-6 py-14 text-center"><h2 className="text-xl font-bold text-[var(--color-brand-primary)]">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p>{action ? <div className="mt-6">{action}</div> : null}</div>;
}

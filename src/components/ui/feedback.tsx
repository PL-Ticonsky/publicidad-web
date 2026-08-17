import type { ReactNode } from "react";

export function Skeleton({ className = "" }: { className?: string }) { return <div className={`animate-pulse rounded-[var(--pp-radius)] bg-[var(--pp-paper-cool)] ${className}`} aria-hidden="true" />; }

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="border-y border-[var(--pp-line)] bg-white px-6 py-14 text-center"><p className="eyebrow">Estado del catálogo</p><h2 className="mt-3 text-3xl text-[var(--pp-navy)]">{title}</h2><p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--pp-navy-700)]">{description}</p>{action ? <div className="mt-7">{action}</div> : null}</div>;
}

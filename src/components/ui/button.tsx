import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "whatsapp";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--signal)]",
  secondary: "bg-[var(--signal)] text-white hover:bg-[var(--signal-bright)]",
  outline: "border border-[var(--color-border-default)] bg-white text-[var(--color-brand-primary)] hover:border-[var(--color-brand-primary)] hover:bg-[var(--color-surface-muted)]",
  ghost: "text-[var(--color-brand-primary)] hover:bg-[var(--color-surface-muted)]",
  whatsapp: "bg-[var(--success)] text-white hover:bg-[#175c3a]",
};

export function buttonClass(variant: ButtonVariant = "primary", className = "") {
  return `font-technical inline-flex min-h-11 items-center justify-center gap-2 rounded-none px-5 py-2.5 text-xs font-semibold uppercase tracking-[.06em] transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[var(--signal)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`;
}

export function Button({ variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({ href, children, variant = "primary", className = "" }: { href: string; children: ReactNode; variant?: ButtonVariant; className?: string }) {
  return <Link href={href} className={buttonClass(variant, className)}>{children}</Link>;
}

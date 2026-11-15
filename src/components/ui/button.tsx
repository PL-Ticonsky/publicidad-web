import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "whatsapp";

const variants: Record<ButtonVariant, string> = {
  primary: "border border-[var(--pp-cyan)] bg-[var(--pp-cyan)] !text-white hover:border-[var(--pp-cyan-600)] hover:bg-[var(--pp-cyan-600)] active:bg-[var(--pp-cyan-700)]",
  secondary: "border border-[var(--pp-cyan)] bg-[var(--pp-cyan)] !text-white hover:border-[var(--pp-cyan-600)] hover:bg-[var(--pp-cyan-600)] active:bg-[var(--pp-cyan-700)]",
  outline: "border border-[var(--pp-navy)] bg-transparent text-[var(--pp-navy)] hover:bg-[var(--pp-paper-cool)] hover:text-[var(--pp-cyan-700)]",
  ghost: "border border-transparent bg-transparent text-[var(--pp-cyan)] hover:text-[var(--pp-cyan-700)]",
  whatsapp: "border border-[var(--pp-success)] bg-[var(--pp-success)] !text-white hover:bg-[#175c3a]",
};

export function buttonClass(variant: ButtonVariant = "primary", className = "") {
  return `font-technical inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--pp-radius)] px-5 py-2.5 text-xs uppercase tracking-[var(--pp-tracking-button)] transition-[background-color,border-color,color,transform] duration-[250ms] disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`;
}

export function Button({ variant = "primary", className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({ href, children, variant = "primary", className = "" }: { href: string; children: ReactNode; variant?: ButtonVariant; className?: string }) {
  return <Link href={href} className={buttonClass(variant, className)}>{children}</Link>;
}

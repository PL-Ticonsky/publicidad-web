import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export const controlClass = "mt-2 min-h-12 w-full rounded-[4px] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-base text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] hover:border-[var(--ink)] focus:border-[var(--ink)] focus:ring-3 focus:ring-[rgba(216,74,39,.18)] disabled:cursor-not-allowed disabled:bg-[var(--paper)]";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={`${controlClass} ${props.className ?? ""}`} />; }
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) { return <select {...props} className={`${controlClass} ${props.className ?? ""}`} />; }
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...props} className={`${controlClass} ${props.className ?? ""}`} />; }

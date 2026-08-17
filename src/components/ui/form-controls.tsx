import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export const controlClass = "mt-2 min-h-12 w-full rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-[var(--pp-paper-cool)] px-4 py-3 text-base text-[var(--pp-navy)] outline-none transition placeholder:text-[var(--pp-gray)] hover:border-[var(--pp-cyan)] focus:border-[var(--pp-cyan)] focus:ring-2 focus:ring-[var(--pp-cyan-pale)] disabled:cursor-not-allowed disabled:opacity-50";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={`${controlClass} ${props.className ?? ""}`} />; }
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) { return <select {...props} className={`${controlClass} ${props.className ?? ""}`} />; }
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...props} className={`${controlClass} ${props.className ?? ""}`} />; }

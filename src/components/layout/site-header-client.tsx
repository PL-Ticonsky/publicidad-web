"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MenuIcon } from "@/components/ui/icons";

const links = [
  ["Catálogo", "/catalogo"],
  ["Categorías", "/#categorias"],
  ["Proceso", "/#como-funciona"],
  ["Preguntas", "/#preguntas"],
] as const;

export function SiteHeaderClient({ whatsappUrl }: { whatsappUrl: string | null }) {
  const [progress, setProgress] = useState(0);
  const menuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function updateProgress() {
      const maximum = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(maximum > 0 ? Math.min(100, (window.scrollY / maximum) * 100) : 0);
    }
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => window.removeEventListener("scroll", updateProgress);
  }, []);

  function closeMenu() {
    if (menuRef.current) menuRef.current.open = false;
  }

  return (
    <header className={`sticky top-0 z-50 bg-white px-[var(--pp-gutter)] transition-shadow duration-[400ms] ${progress > 1 ? "shadow-[var(--pp-shadow-header)]" : ""}`}>
      <div className="mx-auto flex min-h-16 max-w-[var(--container-page)] items-center gap-5 py-2">
        <Link href="/" className="font-display text-[1.35rem] uppercase leading-none tracking-[.02em] text-[var(--pp-navy)]" aria-label="Propagplast — Inicio">
          Propagplast
        </Link>
        <span className="font-technical mr-auto hidden text-[.625rem] uppercase tracking-[var(--pp-tracking-label)] text-[var(--pp-cyan)] sm:block">
          Publicidad física personalizada
        </span>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Navegación principal">
          {links.map(([label, href]) => (
            <Link key={label} href={href} className="border-b-2 border-transparent py-2 text-sm transition-colors hover:border-[var(--pp-cyan)] hover:text-[var(--pp-cyan-700)]">
              {label}
            </Link>
          ))}
        </nav>
        {whatsappUrl ? (
          <a href={whatsappUrl} className="font-technical hidden min-h-10 items-center rounded-[var(--pp-radius)] bg-[var(--pp-cyan)] px-5 text-[.7rem] uppercase tracking-[var(--pp-tracking-button)] text-white transition-colors hover:bg-[var(--pp-cyan-600)] sm:inline-flex">
            Cotizar por WhatsApp
          </a>
        ) : null}
        <details ref={menuRef} className="group relative lg:hidden">
          <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center border border-[var(--pp-line)] bg-white text-[var(--pp-navy)] [&::-webkit-details-marker]:hidden" aria-label="Abrir menú">
            <MenuIcon className="h-6 w-6" />
          </summary>
          <nav className="absolute right-0 top-13 w-[min(19rem,calc(100vw-2.5rem))] border border-[var(--pp-navy)] bg-white p-4 shadow-[var(--pp-shadow-header)]" aria-label="Navegación móvil">
            {links.map(([label, href]) => (
              <Link key={label} href={href} onClick={closeMenu} className="flex min-h-12 items-center border-b border-[var(--pp-line)] text-base hover:text-[var(--pp-cyan)]">
                {label}
              </Link>
            ))}
            {whatsappUrl ? (
              <a href={whatsappUrl} onClick={closeMenu} className="font-technical mt-4 flex min-h-12 items-center justify-center bg-[var(--pp-cyan)] px-4 text-xs uppercase text-white">
                Cotizar por WhatsApp
              </a>
            ) : null}
          </nav>
        </details>
      </div>
      <div className="mx-auto max-w-[var(--container-page)]" aria-hidden="true">
        <div className="relative h-1 overflow-hidden bg-[var(--pp-navy)]">
          <span className="absolute inset-y-0 left-0 bg-[var(--pp-cyan)]" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-0.5 h-px bg-[var(--pp-navy)]" />
      </div>
    </header>
  );
}

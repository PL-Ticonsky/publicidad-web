"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { MenuIcon } from "@/components/ui/icons";

const links = [
  { id: "formas", label: "Formas", href: "/#formas" },
  { id: "catalogo", label: "Catálogo completo", href: "/#catalogo" },
  { id: "historia", label: "Historia", href: "/#historia" },
  { id: "como-funciona", label: "Proceso", href: "/#como-funciona" },
  { id: "preguntas", label: "FAQ", href: "/#preguntas" },
] as const;

type NavigationTarget = (typeof links)[number]["id"];

export function SiteHeaderClient({ whatsappUrl }: { whatsappUrl: string | null }) {
  const [progress, setProgress] = useState(0);
  const [activeTarget, setActiveTarget] = useState<NavigationTarget>("catalogo");
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

  useEffect(() => {
    const sections = links
      .map((link) => document.getElementById(link.id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => Math.abs(left.boundingClientRect.top) - Math.abs(right.boundingClientRect.top))[0];
        if (visible) setActiveTarget(visible.target.id as NavigationTarget);
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  function closeMenu() {
    if (menuRef.current) menuRef.current.open = false;
  }

  return (
    <header className={`site-header ${progress > 1 ? "site-header-scrolled" : ""}`}>
      <div className="site-header-inner">
        <Link href="/" className="site-wordmark" aria-label="Propagplast — Inicio">Propagplast</Link>
        <span className="site-descriptor">Fábrica de publicidad física</span>

        <nav className="site-navigation" aria-label="Navegación principal">
          {links.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="site-navigation-link"
              data-active={activeTarget === link.id ? "true" : undefined}
              aria-current={activeTarget === link.id ? "location" : undefined}
              onClick={() => setActiveTarget(link.id)}
            >
              {link.label}
            </Link>
          ))}
          {whatsappUrl ? <a href={whatsappUrl} className="site-whatsapp">Cotizar por WhatsApp</a> : null}
        </nav>

        <details ref={menuRef} className="site-mobile-menu">
          <summary aria-label="Abrir menú"><MenuIcon className="h-6 w-6" /></summary>
          <nav aria-label="Navegación móvil">
            {links.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                data-active={activeTarget === link.id ? "true" : undefined}
                aria-current={activeTarget === link.id ? "location" : undefined}
                onClick={() => {
                  setActiveTarget(link.id);
                  closeMenu();
                }}
              >
                {link.label}
              </Link>
            ))}
            {whatsappUrl ? <a href={whatsappUrl} onClick={closeMenu}>Cotizar por WhatsApp</a> : null}
          </nav>
        </details>
      </div>

      <div className="site-masthead-rule" aria-hidden="true">
        <div><span style={{ width: `${progress}%` }} /></div>
        <div />
      </div>
    </header>
  );
}

import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { MenuIcon } from "@/components/ui/icons";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-whatsapp-url";

const links = [["Catálogo", "/catalogo"], ["Categorías", "/#categorias"], ["Cómo funciona", "/#como-funciona"], ["Nuestra experiencia", "/#experiencia"], ["Contacto", "/#contacto"]];

export function SiteHeader() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const whatsappUrl = buildWhatsAppUrl(whatsapp);
  return <header className="sticky top-0 z-50 border-b border-[var(--line-soft)] bg-[rgba(250,249,245,.97)]">
    <div className="page-container flex min-h-16 items-center gap-6">
      <Link href="/" className="font-display mr-auto text-xl font-semibold uppercase tracking-[-.03em] text-[var(--signal)]" aria-label="Tinta — Inicio">Tinta</Link>
      <nav className="hidden items-center gap-6 lg:flex" aria-label="Navegación principal">{links.map(([label, href], index) => <Link key={label} href={href} className={`font-technical border-b py-2 text-[10px] uppercase tracking-[.06em] ${index === 0 ? "border-[var(--signal)] text-[var(--signal)]" : "border-transparent text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)]"}`}>{label}</Link>)}</nav>
      {whatsappUrl ? <a href={whatsappUrl} className="font-technical hidden min-h-10 items-center bg-[var(--signal)] px-5 text-[10px] font-semibold uppercase tracking-[.07em] text-white hover:bg-[var(--signal-bright)] sm:inline-flex">Cotizar por WhatsApp</a> : <ButtonLink href="/catalogo" variant="secondary" className="hidden sm:inline-flex">Cotizar</ButtonLink>}
      <details className="relative lg:hidden"><summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center [&::-webkit-details-marker]:hidden" aria-label="Abrir menú"><MenuIcon className="h-6 w-6" /></summary><nav className="absolute right-0 top-12 w-72 border border-[var(--ink)] bg-[var(--paper)] p-4" aria-label="Navegación móvil">{links.map(([label, href]) => <Link key={label} href={href} className="font-technical flex min-h-11 items-center border-b border-[var(--line-soft)] text-xs uppercase">{label}</Link>)}{whatsappUrl ? <a href={whatsappUrl} className="font-technical mt-4 flex min-h-11 items-center justify-center bg-[var(--signal)] px-4 text-xs uppercase text-white">Cotizar por WhatsApp</a> : null}</nav></details>
    </div>
  </header>;
}

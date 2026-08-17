import Link from "next/link";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-whatsapp-url";

export function SiteFooter() {
  const whatsappUrl = buildWhatsAppUrl(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
  return (
    <footer className="mt-auto bg-[var(--pp-paper-cool)] text-[var(--pp-navy)]">
      <div className="page-container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div>
          <Link href="/" className="font-display text-2xl uppercase tracking-[.02em]">Propagplast</Link>
          <p className="eyebrow mt-3 max-w-xs">Publicidad física personalizada</p>
          <p className="mt-5 max-w-sm text-sm leading-6 text-[var(--pp-navy-700)]">Catálogo comercial y generador de solicitudes estimadas para productos promocionales.</p>
        </div>
        <div>
          <h2 className="font-technical text-xs uppercase tracking-[var(--pp-tracking-label)]">Productos</h2>
          <div className="mt-5 grid gap-3 text-sm text-[var(--pp-navy-700)]"><Link href="/catalogo">Ver catálogo</Link><Link href="/#categorias">Explorar categorías</Link></div>
        </div>
        <div>
          <h2 className="font-technical text-xs uppercase tracking-[var(--pp-tracking-label)]">Información</h2>
          <div className="mt-5 grid gap-3 text-sm text-[var(--pp-navy-700)]"><Link href="/#como-funciona">Cómo funciona</Link><Link href="/#preguntas">Preguntas frecuentes</Link></div>
        </div>
        <div>
          <h2 className="font-technical text-xs uppercase tracking-[var(--pp-tracking-label)]">Contacto</h2>
          {whatsappUrl ? <a href={whatsappUrl} className="mt-5 inline-block text-sm text-[var(--pp-cyan)] underline underline-offset-4">WhatsApp comercial →</a> : <p className="mt-5 text-sm text-[var(--pp-navy-700)]">Canal pendiente de configuración</p>}
        </div>
      </div>
      <div className="border-t border-[var(--pp-line)]">
        <div className="page-container flex flex-col gap-2 py-5 text-xs text-[var(--pp-navy-700)] sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} Propagplast. Información empresarial pendiente de publicación.</span>
          <span>Colombia</span>
        </div>
      </div>
    </footer>
  );
}

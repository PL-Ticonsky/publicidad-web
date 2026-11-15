import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { KeychainShapeGallery } from "@/components/home/keychain-shape-gallery";
import { getAllProductLines, type ProductLine } from "@/data/product-lines";
import { getAllActiveProducts } from "@/data/products";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-whatsapp-url";

export const metadata: Metadata = {
  title: "Publicidad que se queda en la mano",
  description: "Productos promocionales personalizados para empresas, eventos y marcas en Colombia.",
};

const stats = [
  ["35 años", "Fabricando material promocional en Bogotá"],
  ["+40", "Formas de troquel listas en inventario"],
  ["8 días", "Producción y despacho desde la aprobación del arte"],
  ["100 u", "Mínimo real de pedido en las líneas principales"],
  ["24 h", "Cotización con precio por escalas y ficha técnica"],
] as const;

const milestones = [
  ["1991", "Abre el taller de troquelado en Puente Aranda con una sola prensa."],
  ["2004", "Entra la línea de mousepads y la sublimación textil."],
  ["2013", "Moldes de inyección propios: llaveros y manillas de silicona."],
  ["2026", "Cinco líneas, despacho neutro y producción para agencias de todo el país."],
] as const;

const faqs = [
  ["¿Todos los productos tienen pedido mínimo?", "Cada producto tiene una cantidad mínima distinta. Puedes consultarla en la ficha y el cotizador no permite seleccionar una cantidad inferior."],
  ["¿Qué opciones de personalización hay?", "Las técnicas disponibles cambian según el material y aparecen directamente en la configuración de cada producto."],
  ["¿Qué archivo debo enviar?", "Comparte el archivo que tengas durante la conversación comercial. El equipo revisará si es adecuado antes de confirmar la producción."],
  ["¿Cómo recibo la estimación?", "Configura el producto en línea y continúa por WhatsApp con el resumen de cantidad, personalización, adicionales y precio estimado."],
] as const;

const catalogOrder = ["llaveros", "mousepads", "canecas", "manillas", "portavasos"] as const;

function Marquee({ items }: { items: readonly string[] }) {
  const strip = (
    <div className="home-marquee-strip">
      {items.map((item) => (
        <span key={item} className="home-marquee-item">
          <span>{item}</span>
          <span className="home-marquee-separator">✳</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="home-marquee" aria-hidden="true">
      <div className="home-marquee-track">{strip}{strip}</div>
    </div>
  );
}

export default function Home() {
  const products = getAllActiveProducts();
  const productLines = getAllProductLines();
  const catalogLines = catalogOrder
    .map((slug) => productLines.find((line) => line.slug === slug))
    .filter((line): line is ProductLine => Boolean(line));
  const whatsappUrl = buildWhatsAppUrl(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
  const marqueeItems = ["Mousepads", "Llaveros", "Canecas", "Manillas", "Portavasos", "Bogotá desde 1991"];

  return (
    <main className="home-page">
      <section id="top" className="home-hero">
        <div className="home-hero-copy">
          <p className="home-kicker">Para agencias · Mousepads · Llaveros · Canecas · Manillas · Portavasos</p>
          <h1>
            <span className="pp-line" style={{ animationDelay: "50ms" }}>Publicidad</span>
            <span className="pp-line" style={{ animationDelay: "180ms" }}>que se queda</span>
            <span className="pp-line home-accent" style={{ animationDelay: "310ms" }}>en la mano</span>
          </h1>
          <p className="home-hero-intro">
            Mousepads, llaveros, canecas, manillas y portavasos producidos en nuestra planta de Bogotá: troquel propio, marcación en línea y entregas que llegan antes de la activación. Tú pones la marca, nosotros la fábrica.
          </p>
          <div className="home-hero-actions">
            <Link href="/catalogo" className="home-button home-button-primary">Armar cotización</Link>
            <Link href="/#catalogo" className="home-button home-button-secondary">Ver catálogo</Link>
          </div>
        </div>

        <div className="home-hero-media">
          <div className="home-production-well">
            <Image src="/brand/taller.jpg" alt="Imagen de referencia de un taller de producción" fill sizes="(max-width: 767px) 100vw, 45vw" preload className="object-cover" />
          </div>
          <p>Imagen de referencia del prototipo visual.</p>
        </div>
      </section>

      <Marquee items={marqueeItems} />

      <section className="home-stats" aria-label="Indicadores comerciales">
        {stats.map(([figure, caption]) => (
          <div key={figure} className="pp-rise">
            <p>{figure}</p>
            <span>{caption}</span>
          </div>
        ))}
      </section>

      <KeychainShapeGallery />

      <section id="catalogo" className="home-section home-catalog" aria-labelledby="catalog-title">
        <h2 id="catalog-title">Todo el catálogo</h2>
        <p className="home-catalog-aside">Cinco líneas, un solo proveedor y una sola factura.</p>
        <div className="home-catalog-list">
          {catalogLines.map((line) => {
            const minimums = products.filter((product) => product.categoryId === line.id).map((product) => product.minimumQuantity);
            const minimum = minimums.length ? `Desde ${Math.min(...minimums)} u` : "Mín. por validar";
            return (
              <Link key={line.id} href={line.href} className="home-catalog-row">
                <span>{line.name}</span>
                <span>{line.shortDescription}</span>
                <span>{minimum} →</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="historia" className="home-section home-story" aria-labelledby="story-title">
        <div className="home-story-copy pp-rise">
          <p className="home-kicker">Nuestra historia</p>
          <h2 id="story-title">35 años imprimiendo<br />marcas en Bogotá</h2>
          <p>
            Propagplast abrió en 1991 como un taller de troquelado en Puente Aranda. Tres décadas después seguimos en el mismo barrio, con planta propia, prensas de serigrafía, sublimación y moldes de inyección hechos en casa. Ese recorrido es la razón por la que una agencia puede pedirnos una forma nueva un lunes y tenerla en la calle la semana siguiente.
          </p>
          <p>Nunca vendemos al cliente final: trabajamos solo con agencias y ese acuerdo se respeta desde 1991.</p>
        </div>
        <div className="home-timeline">
          {milestones.map(([year, copy]) => (
            <div key={year} className="pp-rise">
              <span>{year}</span>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-28 bg-[var(--pp-paper-cool)] py-[var(--pp-section-y)]">
        <div className="page-container">
          <h2 className="[font-size:var(--pp-display-2)]">Cómo se prepara<br />tu solicitud</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {[["01", "Elige el producto", "Explora el catálogo y abre la referencia que mejor se adapte a tu proyecto."], ["02", "Define la configuración", "Compara tramos de precio y selecciona las opciones disponibles."], ["03", "Continúa por WhatsApp", "Revisa el desglose y abre una conversación con el resumen ya preparado."]].map(([number, title, copy]) => (
              <li key={number}>
                <p className="font-display text-6xl leading-none text-transparent [-webkit-text-stroke:1.5px_var(--pp-cyan)]">{number}</p>
                <h3 className="mt-4 text-xl tracking-[.05em]">{title}</h3>
                <p className="mt-3 max-w-[32ch] text-sm leading-6 text-[var(--pp-navy-700)]">{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="page-container grid gap-[var(--pp-column-gap)] py-[var(--pp-section-y)] lg:grid-cols-[1.1fr_.9fr]">
        <div>
          <p className="eyebrow">Experiencia física, acceso digital</p>
          <h2 className="mt-4 [font-size:var(--pp-display-3)]">Publicidad fuera de la pantalla</h2>
          <p className="mt-6 max-w-[var(--pp-measure)] leading-7">La experiencia de producción ahora se conecta con una forma más sencilla de explorar productos, comparar cantidades y preparar una solicitud estimada en línea.</p>
          <p className="mt-4 max-w-[var(--pp-measure)] italic leading-7 text-[var(--pp-navy-700)]">El catálogo ayuda a iniciar la conversación; cada valor final requiere validación comercial.</p>
        </div>
        <div id="preguntas" className="scroll-mt-28">
          <h2 className="[font-size:var(--pp-display-3)]">Preguntas<br />frecuentes</h2>
          <div className="mt-6 border-t border-[var(--pp-line)]">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group border-b border-[var(--pp-line)]">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 text-[clamp(1rem,1.4vw,1.2rem)] transition-colors hover:text-[var(--pp-cyan)] [&::-webkit-details-marker]:hidden">
                  <span>{question}</span><span className="font-display text-xl text-[var(--pp-cyan)] group-open:hidden">+</span><span className="font-display hidden text-xl text-[var(--pp-cyan)] group-open:inline">−</span>
                </summary>
                <p className="pb-6 text-sm leading-6 text-[var(--pp-navy-700)] [animation:ppInk_400ms_var(--pp-ease)_both]">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="scroll-mt-28 bg-[var(--pp-navy)] py-[var(--pp-section-y)] text-white">
        <div className="page-container flex flex-wrap items-end justify-between gap-10">
          <div>
            <p className="eyebrow !text-[var(--pp-cyan-light)]">Solicitud comercial</p>
            <h2 className="mt-4 [font-size:var(--pp-display-2)] text-white">Cuéntanos qué quieres<br /><span className="text-[var(--pp-cyan-light)]">producir</span></h2>
            <p className="mt-6 max-w-[38ch] text-[var(--pp-cyan-pale)]">Elige una referencia para obtener un desglose estimado y continuar la conversación por WhatsApp.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/catalogo" className="home-button home-button-primary">Armar solicitud</Link>
            {whatsappUrl ? <a href={whatsappUrl} className="home-button home-button-invert">Hablar por WhatsApp →</a> : null}
          </div>
        </div>
      </section>
    </main>
  );
}

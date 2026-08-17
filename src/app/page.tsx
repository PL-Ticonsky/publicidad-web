import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { PromotionSplash } from "@/components/promotion/promotion-splash";
import { ButtonLink } from "@/components/ui/button";
import { getAllCategories } from "@/data/categories";
import { getAllActiveProducts, getFeaturedProducts, getProductBySlug } from "@/data/products";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-whatsapp-url";

export const metadata: Metadata = {
  title: "Publicidad que se queda en la mano",
  description: "Productos promocionales personalizados para empresas, eventos y marcas en Colombia.",
};

const faqs = [
  ["¿Todos los productos tienen pedido mínimo?", "Cada producto tiene una cantidad mínima distinta. Puedes consultarla en la ficha y el cotizador no permite seleccionar una cantidad inferior."],
  ["¿Qué opciones de personalización hay?", "Las técnicas disponibles cambian según el material y aparecen directamente en la configuración de cada producto."],
  ["¿Qué archivo debo enviar?", "Comparte el archivo que tengas durante la conversación comercial. El equipo revisará si es adecuado antes de confirmar la producción."],
  ["¿Cómo recibo la estimación?", "Configura el producto en línea y continúa por WhatsApp con el resumen de cantidad, personalización, adicionales y precio estimado."],
];

const promotionProductSlug = "llavero-metalico-redondo";

function Marquee({ items }: { items: string[] }) {
  const strip = <div className="flex w-max shrink-0 gap-10 pr-10">{items.map((item) => <span key={item} className="flex items-center gap-10"><span>{item}</span><span className="text-[var(--pp-cyan)] [-webkit-text-stroke:0]">✳</span></span>)}</div>;
  return <div className="overflow-hidden bg-[var(--pp-paper-cool)] py-3.5" aria-hidden="true"><div className="pp-marquee flex w-max font-display text-[clamp(2rem,3.4vw,3.25rem)] uppercase leading-none text-transparent [-webkit-text-stroke:1px_var(--pp-navy-700)]">{strip}{strip}</div></div>;
}

export default function Home() {
  const products = getAllActiveProducts();
  const featured = getFeaturedProducts().slice(0, 4);
  const categories = getAllCategories().filter((category) => products.some((product) => product.categoryId === category.id));
  const heroProduct = featured[0] ?? products[0];
  const promotionProduct = getProductBySlug(promotionProductSlug);
  if (!promotionProduct) throw new Error(`No se encontró el producto promocional: ${promotionProductSlug}`);
  const promotionImage = promotionProduct.images.find((image) => image.isPrimary) ?? promotionProduct.images[0];
  if (!promotionImage?.src.startsWith("/")) throw new Error(`El producto promocional ${promotionProductSlug} no tiene una imagen local válida`);
  const whatsappUrl = buildWhatsAppUrl(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
  const promotionMessage = ["Hola, quiero solicitar información sobre la promoción de llaveros.", "", "Cupón: LLAVERO", `Producto: ${promotionProduct.name}`, ...(promotionProduct.sku ? [`Referencia: ${promotionProduct.sku}`] : [])].join("\n");
  const promotionWhatsappUrl = buildWhatsAppUrl(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER, promotionMessage);

  const stats = [
    [`${products.length}`, "Referencias activas en el catálogo local"],
    [`${categories.length}`, "Categorías para explorar por necesidad"],
    ["100 %", "Cálculo y personalización en el navegador"],
    ["1 paso", "Del resumen estimado a la conversación en WhatsApp"],
  ];

  return (
    <main>
      <PromotionSplash productName={promotionProduct.name} productReference={promotionProduct.sku} productHref={`/producto/${promotionProduct.slug}`} imageSrc={promotionImage.src} imageAlt={promotionImage.alt} whatsappUrl={promotionWhatsappUrl} />

      <section id="top" className="page-container flex flex-wrap items-start gap-[var(--pp-column-gap)] py-[clamp(2rem,5vw,4.5rem)]">
        <div className="min-w-0 flex-[1.2_1_28rem]">
          <p className="eyebrow">Productos promocionales · Catálogo local · Colombia</p>
          <h1 className="mt-5 [font-size:var(--pp-display-1)] leading-[.86]">
            <span className="pp-line block" style={{ animationDelay: "50ms" }}>Publicidad</span>
            <span className="pp-line block" style={{ animationDelay: "180ms" }}>que se queda</span>
            <span className="pp-line block text-[var(--pp-cyan)]" style={{ animationDelay: "310ms" }}>en la mano</span>
          </h1>
          <p className="mt-7 max-w-[44ch] [font-size:var(--pp-body-lg)] leading-8">Productos promocionales personalizados para empresas, eventos y marcas en Colombia. Convierte una idea en un objeto que se puede tocar, usar y recordar.</p>
          <div className="mt-8 flex flex-wrap gap-3"><ButtonLink href="/catalogo" className="min-h-13 px-7">Explorar catálogo</ButtonLink>{whatsappUrl ? <a href={whatsappUrl} className="font-technical inline-flex min-h-13 items-center border border-[var(--pp-navy)] px-7 text-xs uppercase tracking-[var(--pp-tracking-button)] hover:bg-[var(--pp-paper-cool)]">Cotizar por WhatsApp</a> : null}</div>
        </div>
        <div className="min-w-0 flex-[.8_1_19rem]">
          {heroProduct ? <Link href={`/producto/${heroProduct.slug}`} className="halftone relative block aspect-[4/5] max-h-[38rem] overflow-hidden rounded-[var(--pp-radius)] bg-[var(--pp-paper-cool)]"><ProductImage src={heroProduct.images[0]?.src ?? null} alt={heroProduct.images[0]?.alt ?? heroProduct.name} preload sizes="(max-width: 768px) calc(100vw - 40px), 38vw" className="object-contain p-[8%]" /><span className="font-technical absolute bottom-3 left-3 z-10 bg-white px-2 py-1 text-[.65rem] uppercase text-[var(--pp-navy-700)]">{heroProduct.name}</span></Link> : <div className="aspect-[4/5] bg-[var(--pp-paper-cool)]" />}
          <p className="mt-2.5 text-xs italic text-[var(--pp-navy-700)]">Explora cada referencia para conocer cantidades, técnicas y opciones disponibles.</p>
        </div>
      </section>

      <Marquee items={categories.map((category) => category.name)} />

      <section aria-label="Cifras del catálogo" className="page-container grid grid-cols-2 gap-8 py-[var(--pp-section-y)] md:grid-cols-4">
        {stats.map(([figure, caption]) => <div key={figure} className="pp-rise"><p className="font-display [font-size:var(--pp-numeral)] leading-none text-[var(--pp-cyan)]">{figure}</p><p className="mt-2 max-w-[26ch] text-sm leading-6">{caption}</p></div>)}
      </section>

      <section id="categorias" className="page-container scroll-mt-28 pb-[var(--pp-section-y)]">
        <div className="flex flex-wrap items-end justify-between gap-6"><h2 className="[font-size:var(--pp-display-2)]">Todo el catálogo</h2><p className="max-w-[34ch] text-sm italic text-[var(--pp-navy-700)]">Explora el catálogo por categoría y conserva las reglas de cada referencia.</p></div>
        <div className="mt-8 border-t border-[var(--pp-line)]">{categories.map((category) => { const count = products.filter((product) => product.categoryId === category.id).length; return <Link key={category.id} href={`/catalogo/${category.slug}`} className="group grid grid-cols-[1fr_auto] items-center gap-5 border-b border-[var(--pp-line)] px-1 py-5 transition-[padding,background,color] duration-300 ease-[var(--pp-ease)] hover:bg-[var(--pp-paper-cool)] hover:pl-[1.125rem] hover:text-[var(--pp-cyan)] sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_auto]"><span className="font-display [font-size:var(--pp-display-4)] uppercase leading-none">{category.name}</span><span className="hidden text-sm leading-6 text-[var(--pp-navy-700)] sm:block">{category.description}</span><span className="font-technical text-xs uppercase text-[var(--pp-cyan)]">{count} ref. →</span></Link>; })}</div>
      </section>

      <section className="page-container pb-[var(--pp-section-y)]">
        <div className="flex flex-wrap items-end justify-between gap-6"><div><p className="eyebrow">Selección del catálogo</p><h2 className="mt-4 [font-size:var(--pp-display-2)]">Productos destacados</h2></div><Link href="/catalogo" className="font-technical text-xs uppercase text-[var(--pp-cyan)]">Ver catálogo completo →</Link></div>
        {featured.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{featured.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <p className="mt-8 border-y border-[var(--pp-line)] py-12">No hay productos destacados disponibles.</p>}
      </section>

      <section id="como-funciona" className="scroll-mt-28 bg-[var(--pp-paper-cool)] py-[var(--pp-section-y)]">
        <div className="page-container"><h2 className="[font-size:var(--pp-display-2)]">Cómo se prepara<br />tu solicitud</h2><ol className="mt-10 grid gap-8 md:grid-cols-3">{[["01", "Elige el producto", "Explora el catálogo y abre la referencia que mejor se adapte a tu proyecto."], ["02", "Define la configuración", "Compara tramos de precio y selecciona las opciones disponibles."], ["03", "Continúa por WhatsApp", "Revisa el desglose y abre una conversación con el resumen ya preparado."]].map(([number, title, copy]) => <li key={number}><p className="font-display text-6xl leading-none text-transparent [-webkit-text-stroke:1.5px_var(--pp-cyan)]">{number}</p><h3 className="mt-4 text-xl tracking-[.05em]">{title}</h3><p className="mt-3 max-w-[32ch] text-sm leading-6 text-[var(--pp-navy-700)]">{copy}</p></li>)}</ol></div>
      </section>

      <section className="page-container grid gap-[var(--pp-column-gap)] py-[var(--pp-section-y)] lg:grid-cols-[1.1fr_.9fr]">
        <div><p className="eyebrow">Experiencia física, acceso digital</p><h2 className="mt-4 [font-size:var(--pp-display-3)]">Publicidad fuera de la pantalla</h2><p className="mt-6 max-w-[var(--pp-measure)] leading-7">La experiencia de producción ahora se conecta con una forma más sencilla de explorar productos, comparar cantidades y preparar una solicitud estimada en línea.</p><p className="mt-4 max-w-[var(--pp-measure)] italic leading-7 text-[var(--pp-navy-700)]">El catálogo ayuda a iniciar la conversación; cada valor final requiere validación comercial.</p></div>
        <div id="preguntas" className="scroll-mt-28"><h2 className="[font-size:var(--pp-display-3)]">Preguntas<br />frecuentes</h2><div className="mt-6 border-t border-[var(--pp-line)]">{faqs.map(([question, answer]) => <details key={question} className="group border-b border-[var(--pp-line)]"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 text-[clamp(1rem,1.4vw,1.2rem)] transition-colors hover:text-[var(--pp-cyan)] [&::-webkit-details-marker]:hidden"><span>{question}</span><span className="font-display text-xl text-[var(--pp-cyan)] group-open:hidden">+</span><span className="font-display hidden text-xl text-[var(--pp-cyan)] group-open:inline">−</span></summary><p className="pb-6 text-sm leading-6 text-[var(--pp-navy-700)] [animation:ppInk_400ms_var(--pp-ease)_both]">{answer}</p></details>)}</div></div>
      </section>

      <section id="contacto" className="scroll-mt-28 bg-[var(--pp-navy)] py-[var(--pp-section-y)] text-white"><div className="page-container flex flex-wrap items-end justify-between gap-10"><div><p className="eyebrow !text-[var(--pp-cyan-light)]">Solicitud comercial</p><h2 className="mt-4 [font-size:var(--pp-display-2)] text-white">Cuéntanos qué quieres<br /><span className="text-[var(--pp-cyan-light)]">producir</span></h2><p className="mt-6 max-w-[38ch] text-[var(--pp-cyan-pale)]">Elige una referencia para obtener un desglose estimado y continuar la conversación por WhatsApp.</p></div><div className="flex flex-wrap gap-3"><ButtonLink href="/catalogo" className="min-h-13">Armar solicitud</ButtonLink>{whatsappUrl ? <a href={whatsappUrl} className="font-technical inline-flex min-h-13 items-center border border-[var(--pp-cyan-light)] px-6 text-xs uppercase tracking-[var(--pp-tracking-button)] text-white hover:bg-[var(--pp-navy-700)]">Hablar por WhatsApp →</a> : null}</div></div></section>
    </main>
  );
}

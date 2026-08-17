import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductGallery } from "@/components/product/product-gallery";
import { ProductViewEvent } from "@/components/product/product-view-event";
import { ButtonLink } from "@/components/ui/button";
import { getAdditionalsByIds } from "@/data/additionals";
import { getCategoryById } from "@/data/categories";
import { isCustomizerProductSupported } from "@/data/customizer/supported-products";
import { getAllActiveProducts, getProductBySlug } from "@/data/products";
import { getTechniquesByIds } from "@/data/techniques";
import { assertCatalogIntegrity } from "@/data/validate-catalog";
import { formatCOP } from "@/lib/format";

export function generateStaticParams() {
  assertCatalogIntegrity();
  return getAllActiveProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/producto/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };

  return {
    title: product.name,
    description: product.description,
    openGraph: { title: product.name, description: product.description, type: "website" },
  };
}

export default async function ProductPage({ params }: PageProps<"/producto/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const category = getCategoryById(product.categoryId);
  const techniques = getTechniquesByIds(product.availableTechniqueIds);
  const additionals = getAdditionalsByIds(product.availableAdditionalIds);
  const supportsCustomizer = isCustomizerProductSupported(product.slug);
  const lowestPrice = product.priceTiers.length
    ? Math.min(...product.priceTiers.map((tier) => tier.unitPrice))
    : null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.images.map((image) => image.src),
    offers: lowestPrice !== null
      ? { "@type": "AggregateOffer", priceCurrency: "COP", lowPrice: lowestPrice }
      : undefined,
  };

  return (
    <main className="min-h-screen">
      <ProductViewEvent id={product.id} slug={product.slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <div className="page-container pb-[var(--pp-section-y)] pt-8 sm:pt-12">
        <Link href="/catalogo" className="font-technical inline-flex min-h-11 items-center text-xs uppercase text-[var(--pp-cyan)] transition hover:text-[var(--pp-cyan-700)]">
          ← Volver al catálogo
        </Link>

        <nav aria-label="Migas de pan" className="mt-1 text-sm italic text-[var(--pp-navy-700)]">
          <Link href="/catalogo" className="underline underline-offset-4">Catálogo</Link>
          <span aria-hidden="true"> / </span>
          {category ? <Link href={`/catalogo/${category.slug}`} className="underline underline-offset-4">{category.name}</Link> : <span>Producto</span>}
        </nav>

        <section className="mt-7 grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,.92fr)] lg:items-start lg:gap-[var(--pp-column-gap)]">
          <ProductGallery images={product.images} name={product.name} />
          <div className="border-t-4 border-[var(--pp-navy)] pt-5">
            <p className="eyebrow">{category?.name ?? "Producto"} {product.sku ? `/ Ref. ${product.sku}` : ""}</p>
            <h1 className="mt-4 text-[clamp(3rem,6vw,5.5rem)] leading-[.9]">{product.name}</h1>
            <p className="mt-6 max-w-[var(--pp-measure)] text-base leading-7 text-[var(--pp-navy-700)]">{product.description}</p>

            <dl className="mt-8 grid grid-cols-2 border-y border-[var(--pp-line)] py-5 text-sm">
              <div>
                <dt className="text-[var(--pp-navy-700)]">Pedido mínimo</dt>
                <dd className="font-display mt-2 text-2xl text-[var(--pp-cyan)]">{product.minimumQuantity.toLocaleString("es-CO")} unidades</dd>
              </div>
              <div>
                <dt className="text-[var(--pp-navy-700)]">Valor base desde</dt>
                <dd className="font-display mt-2 text-2xl text-[var(--pp-cyan)]">{lowestPrice !== null ? `${formatCOP(lowestPrice)} / unidad` : "Por validar"}</dd>
              </div>
            </dl>

            <div className="mt-7">
              <h2 className="font-technical text-xs uppercase tracking-[var(--pp-tracking-label)]">Técnicas disponibles</h2>
              <ul className="mt-3 border-t border-[var(--pp-line)]">
                {techniques.map((technique) => (
                  <li key={technique.id} className="border-b border-[var(--pp-line)] py-3.5">
                    <span className="font-semibold">{technique.name}</span>
                    {technique.description ? <span className="ml-2 text-sm text-[var(--pp-navy-700)]">— {technique.description}</span> : null}
                  </li>
                ))}
              </ul>
            </div>

            {additionals.length > 0 ? (
              <p className="mt-5 text-sm text-[var(--pp-navy-700)]">
                También puedes configurar {additionals.map((additional) => additional.name.toLocaleLowerCase("es")).join(", ")}.
              </p>
            ) : null}

            <div className={`mt-8 grid gap-3 ${supportsCustomizer ? "sm:grid-cols-2" : ""}`}>
              {supportsCustomizer ? (
                <ButtonLink href={`/producto/${product.slug}/personalizar`} className="min-h-14 w-full">
                  Abrir personalizador
                </ButtonLink>
              ) : null}
              <ButtonLink href={`/cotizador?producto=${product.slug}`} variant={supportsCustomizer ? "outline" : "primary"} className="min-h-14 w-full">
                Configurar cotización aproximada
              </ButtonLink>
            </div>
            <p className="mt-4 text-xs leading-5 text-[var(--pp-navy-700)]">
              El valor final puede variar según el diseño, técnica de personalización, materiales, disponibilidad, urgencia y condiciones de entrega.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

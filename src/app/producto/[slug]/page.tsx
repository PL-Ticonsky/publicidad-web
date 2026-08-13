import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductGallery } from "@/components/product/product-gallery";
import { ProductViewEvent } from "@/components/product/product-view-event";
import { ButtonLink } from "@/components/ui/button";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { getAdditionalsByIds } from "@/data/additionals";
import { getCategoryById } from "@/data/categories";
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
      <div className="page-container py-8 sm:py-12">
        <Link href="/catalogo" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[var(--color-text-secondary)] transition hover:text-[var(--color-brand-primary)]">
          <ArrowLeftIcon className="h-4 w-4" /> Volver al catálogo
        </Link>

        <nav aria-label="Migas de pan" className="mt-2 text-sm text-[var(--muted)]">
          <Link href="/catalogo" className="underline underline-offset-4">Catálogo</Link>
          <span aria-hidden="true"> / </span>
          {category ? <Link href={`/catalogo/${category.slug}`} className="underline underline-offset-4">{category.name}</Link> : <span>Producto</span>}
        </nav>

        <section className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(360px,2fr)] lg:items-start lg:gap-12">
          <ProductGallery images={product.images} name={product.name} />
          <div className="border-t border-[var(--ink)] pt-6">
            <p className="eyebrow">{category?.name ?? "Producto"} {product.sku ? `/ Ref. ${product.sku}` : ""}</p>
            <h1 className="mt-4 text-[clamp(2.5rem,5vw,3.8rem)] leading-[1.02]">{product.name}</h1>
            <p className="mt-6 text-base leading-7 text-[var(--muted)]">{product.description}</p>

            <dl className="font-technical mt-8 grid grid-cols-2 border-y border-[var(--line-soft)] py-5 text-[10px] uppercase">
              <div>
                <dt className="text-[var(--muted)]">Pedido mínimo</dt>
                <dd className="mt-2">{product.minimumQuantity.toLocaleString("es-CO")} unidades</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Valor estimado desde</dt>
                <dd className="mt-2">{lowestPrice !== null ? `${formatCOP(lowestPrice)} / unidad` : "Validación de asesor"}</dd>
              </div>
            </dl>

            <div className="mt-7">
              <h2 className="font-technical text-[10px] uppercase tracking-[.08em]">Técnicas disponibles</h2>
              <ul className="mt-3 border-t border-[var(--line-soft)]">
                {techniques.map((technique) => (
                  <li key={technique.id} className="border-b border-[var(--line-soft)] py-3">
                    <span className="font-semibold">{technique.name}</span>
                    {technique.description ? <span className="ml-2 text-sm text-[var(--muted)]">— {technique.description}</span> : null}
                  </li>
                ))}
              </ul>
            </div>

            {additionals.length > 0 ? (
              <p className="mt-5 text-sm text-[var(--muted)]">
                También puedes configurar {additionals.map((additional) => additional.name.toLocaleLowerCase("es")).join(", ")}.
              </p>
            ) : null}

            <ButtonLink href={`/cotizador?producto=${product.slug}`} className="mt-8 min-h-14 w-full">
              Configurar cotización aproximada
            </ButtonLink>
            <p className="mt-4 text-xs leading-5 text-[var(--muted)]">
              El valor final puede variar según el diseño, técnica de personalización, materiales, disponibilidad, urgencia y condiciones de entrega.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

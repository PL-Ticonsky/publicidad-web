import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogNavigation } from "@/components/catalog-navigation";
import { ProductImage } from "@/components/product-image";
import { ProductCard } from "@/components/product-card";
import { getAllCategories, getCategoryBySlug } from "@/data/categories";
import { getProductLineBySlug } from "@/data/product-lines";
import { getProductsByCategory } from "@/data/products";

interface CategoryPageProps { params: Promise<{ categorySlug: string }>; }

export function generateStaticParams() { return getAllCategories().map((category) => ({ categorySlug: category.slug })); }

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) return { title: "Categoría no encontrada" };
  return { title: category.title ?? `${category.name} personalizados`, description: category.description };
}

export default async function CategoryCatalogPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);
  if (!category) notFound();
  const productLine = getProductLineBySlug(categorySlug);
  if (!productLine) notFound();
  const products = getProductsByCategory(category.id);
  return (
    <main className="min-h-screen">
      <header className="page-container pb-8 pt-10 sm:pb-12 sm:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-7">
          <div className="min-w-0"><p className="eyebrow">Catálogo / {category.name}</p><h1 className="mt-4 max-w-4xl break-words [font-size:var(--pp-display-1)]">{category.title ?? `${category.name} personalizados`}</h1></div>
          {category.description ? <p className="max-w-[34ch] text-base italic leading-7 text-[var(--pp-navy-700)]">{category.description}</p> : null}
        </div>
        <div className="mt-9"><CatalogNavigation activeSlug={category.slug} /></div>
      </header>
      <section className="page-container pb-[var(--pp-section-y)]">
        {productLine.commercialDataStatus === "pending" ? (
          <article className="grid overflow-hidden border-y border-[var(--pp-line)] bg-[var(--pp-paper-cool)] md:grid-cols-[minmax(16rem,.8fr)_minmax(0,1.2fr)] md:items-center">
            <div className="halftone relative aspect-[4/3] min-h-64">
              <ProductImage src={productLine.illustrationSrc} alt={productLine.alt} sizes="(max-width: 768px) 100vw, 42vw" className="object-contain p-[8%]" />
            </div>
            <div className="border-t border-[var(--pp-line)] p-7 md:border-l md:border-t-0 md:p-10">
              <p className="eyebrow">Información comercial pendiente</p>
              <h2 className="mt-4 [font-size:var(--pp-display-3)]">Referencias por validar</h2>
              <p className="mt-5 max-w-[52ch] leading-7 text-[var(--pp-navy-700)]">Esta línea forma parte del catálogo aprobado, pero todavía no cuenta con referencias, cantidades o precios confirmados para publicar. No mostramos datos provisionales como información comercial.</p>
            </div>
          </article>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        )}
      </section>
    </main>
  );
}

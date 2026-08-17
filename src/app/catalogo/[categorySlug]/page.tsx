import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogNavigation } from "@/components/catalog-navigation";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/ui/feedback";
import { getAllCategories, getCategoryBySlug } from "@/data/categories";
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
  const products = getProductsByCategory(category.id);
  return (
    <main className="min-h-screen">
      <header className="page-container pb-8 pt-10 sm:pb-12 sm:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-7">
          <div><p className="eyebrow">Catálogo / {category.name}</p><h1 className="mt-4 max-w-4xl [font-size:var(--pp-display-1)]">{category.title ?? `${category.name} personalizados`}</h1></div>
          {category.description ? <p className="max-w-[34ch] text-base italic leading-7 text-[var(--pp-navy-700)]">{category.description}</p> : null}
        </div>
        <div className="mt-9"><CatalogNavigation activeSlug={category.slug} /></div>
      </header>
      <section className="page-container pb-[var(--pp-section-y)]">
        {products.length === 0 ? <EmptyState title="Actualmente no hay productos disponibles en esta categoría" description="Estamos preparando nuevas referencias. Vuelve a consultar próximamente." /> : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        )}
      </section>
    </main>
  );
}

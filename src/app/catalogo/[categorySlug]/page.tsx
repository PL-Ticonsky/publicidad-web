import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/ui/feedback";
import { getAllCategories, getCategoryBySlug } from "@/data/categories";
import { getProductsByCategory } from "@/data/products";

interface CategoryPageProps {
  params: Promise<{ categorySlug: string }>;
}

export function generateStaticParams() {
  return getAllCategories().map((category) => ({
    categorySlug: category.slug,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    return { title: "Categoría no encontrada" };
  }

  return {
    title: category.title ?? `${category.name} personalizados`,
    description: category.description,
  };
}

export default async function CategoryCatalogPage({
  params,
}: CategoryPageProps) {
  const { categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) notFound();

  const products = getProductsByCategory(category.id);

  return (
    <main className="min-h-screen">
      <section className="border-b border-black/8 bg-white">
        <div className="page-container py-14 sm:py-20">
          <p className="eyebrow">Catálogo / {category.name}</p>
          <h1 className="mt-4 max-w-3xl text-[clamp(2.5rem,5vw,3.8rem)] font-extrabold leading-[1.06] tracking-[-.045em] text-[var(--color-brand-primary)]">
            {category.title ?? `${category.name} personalizados`}
          </h1>
          {category.description ? (
            <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--color-text-secondary)] sm:text-lg">
              {category.description}
            </p>
          ) : null}
        </div>
      </section>

      <section className="page-container py-10 sm:py-14 lg:py-16">
        {products.length === 0 ? (
          <EmptyState
            title="Actualmente no hay productos disponibles en esta categoría"
            description="Estamos preparando nuevas referencias. Vuelve a consultar próximamente."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/ui/feedback";
import { getAllActiveProducts } from "@/data/products";

export const metadata: Metadata = {
  title: "Catálogo de productos | Promocionales para empresas",
  description:
    "Explora productos promocionales y soluciones de publicidad física para tu empresa.",
};

export default function CatalogoPage() {
  const products = getAllActiveProducts();

  return (
    <main className="min-h-screen">
      <section className="border-b border-black/8 bg-white">
        <div className="page-container py-14 sm:py-20">
          <p className="eyebrow">Catálogo corporativo</p>
          <h1 className="mt-4 max-w-3xl text-[clamp(2.5rem,5vw,3.8rem)] font-extrabold leading-[1.06] tracking-[-.045em] text-[var(--color-brand-primary)]">
            Productos pensados para hacer visible tu marca
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[var(--color-text-secondary)] sm:text-lg">
            Soluciones promocionales para campañas, eventos y equipos. Selecciona un producto y conoce sus opciones de personalización y precios por volumen.
          </p>
        </div>
      </section>

      <section className="page-container py-10 sm:py-14 lg:py-16">
        {products.length === 0 ? (
          <EmptyState title="Estamos preparando el catálogo" description="Pronto encontrarás aquí nuestros productos." />
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

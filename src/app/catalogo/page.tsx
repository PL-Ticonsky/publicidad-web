import type { Metadata } from "next";
import { CatalogNavigation } from "@/components/catalog-navigation";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/ui/feedback";
import { getAllActiveProducts } from "@/data/products";

export const metadata: Metadata = {
  title: "Catálogo | Cinco líneas promocionales",
  description: "Explora las líneas Propagplast: canecas, manillas, llaveros, mousepads y portavasos.",
};

export default function CatalogoPage() {
  const products = getAllActiveProducts();
  return (
    <main className="min-h-screen">
      <header className="page-container pb-8 pt-10 sm:pb-12 sm:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-7">
          <div><p className="eyebrow">Catálogo corporativo</p><h1 className="mt-4 [font-size:var(--pp-display-1)]">Catálogo<br /><span className="text-[var(--pp-cyan)]">Propagplast</span></h1></div>
          <p className="max-w-[34ch] text-base italic leading-7 text-[var(--pp-navy-700)]">Cinco líneas promocionales y únicamente las referencias comerciales que ya cuentan con datos aprobados.</p>
        </div>
        <div className="mt-9"><CatalogNavigation /></div>
      </header>
      <section className="page-container pb-[var(--pp-section-y)]">
        {products.length === 0 ? <EmptyState title="Estamos preparando el catálogo" description="Pronto encontrarás aquí nuestros productos." /> : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
        )}
      </section>
    </main>
  );
}

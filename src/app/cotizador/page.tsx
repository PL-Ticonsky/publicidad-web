import type { Metadata } from "next";
import Link from "next/link";

import { ProductQuoteCalculator } from "@/components/product-quote-calculator";
import { EmptyState } from "@/components/ui/feedback";
import { keychainShapes } from "@/data/keychain-shapes";
import { getAllActiveProducts, getProductBySlug } from "@/data/products";

export const metadata: Metadata = {
  title: "Cotizador de productos promocionales",
  description: "Configura una cotización aproximada en tu navegador y continúa la conversación por WhatsApp.",
};

export default async function QuotePage({ searchParams }: { searchParams: Promise<{ producto?: string | string[]; forma?: string | string[] }> }) {
  const { producto, forma } = await searchParams;
  const selectedProduct = typeof producto === "string" ? getProductBySlug(producto) : undefined;

  if (!selectedProduct) {
    const products = getAllActiveProducts();
    return (
      <main className="page-container min-h-[70vh] py-[var(--pp-section-y)]">
        <EmptyState
          title={typeof producto === "string" ? "El producto no está disponible" : "Elige un producto para cotizar"}
          description="La cotización se configura por producto para aplicar correctamente sus cantidades, técnicas y precios."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              {products.slice(0, 4).map((product) => (
                <Link key={product.id} href={`/cotizador?producto=${product.slug}`} className="font-technical inline-flex min-h-11 items-center border border-[var(--ink)] px-4 text-xs uppercase hover:bg-[var(--ink)] hover:text-white">
                  {product.name}
                </Link>
              ))}
            </div>
          }
        />
      </main>
    );
  }

  const requestedShape = selectedProduct.slug === "llavero-acrilico-personalizado" && typeof forma === "string"
    ? keychainShapes.find((shape) => shape.id === forma)?.name ?? (forma === "troquel-a-medida" ? "Troquel a medida" : undefined)
    : undefined;

  return (
    <main className="min-h-screen">
      <div className="page-container pb-[var(--pp-section-y)] pt-8 sm:pt-12">
        <Link href={`/producto/${selectedProduct.slug}`} className="font-technical inline-flex min-h-11 items-center text-xs uppercase text-[var(--pp-cyan)] hover:text-[var(--pp-cyan-700)]">
          ← Volver al producto
        </Link>
        <section className="mt-3"><ProductQuoteCalculator key={`${selectedProduct.slug}:${requestedShape ?? ""}`} product={selectedProduct} requestedShape={requestedShape} /></section>
      </div>
    </main>
  );
}

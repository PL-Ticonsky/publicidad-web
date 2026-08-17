import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCustomizationFlow } from "@/components/personalization/product-customization-flow";
import { ButtonLink } from "@/components/ui/button";
import {
  getApprovedCustomizerTemplate,
  isCustomizerProductSupported,
} from "@/data/customizer/supported-products";
import { getAllActiveProducts, getProductBySlug } from "@/data/products";

export function generateStaticParams() {
  return getAllActiveProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/producto/[slug]/personalizar">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: `Personalizar ${product.name}`,
    description: `Crea una previsualización local para ${product.name} antes de continuar al cotizador.`,
  };
}

export default async function PersonalizeProductPage({ params }: PageProps<"/producto/[slug]/personalizar">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  if (!isCustomizerProductSupported(product.slug)) {
    return (
      <main className="page-container min-h-[70vh] py-[var(--pp-section-y)]">
        <section className="mx-auto max-w-3xl border-y border-[var(--pp-line)] bg-white py-10" aria-labelledby="unsupported-title">
          <p className="eyebrow">Previsualización no disponible</p>
          <h1 id="unsupported-title" className="mt-4 text-4xl sm:text-5xl">Este producto no admite personalización visual</h1>
          <p className="mt-5 leading-7 text-[var(--muted)]">
            Puedes configurar la solicitud estimada normalmente. No se añadirá ninguna referencia a un PNG en el resumen ni en WhatsApp.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href={`/cotizador?producto=${product.slug}`}>Continuar al cotizador</ButtonLink>
            <Link href={`/producto/${product.slug}`} className="font-technical inline-flex min-h-11 items-center px-4 text-xs uppercase underline underline-offset-4">Volver al producto</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <ProductCustomizationFlow
      product={product}
      previewAvailable={Boolean(getApprovedCustomizerTemplate(product.slug))}
    />
  );
}

"use client";

import Link from "next/link";
import { useCallback, useState, type MouseEvent } from "react";

import { ProductCustomizer, type CustomizerPreview } from "@/components/customizer";
import { useCustomizerPreview } from "@/components/personalization/customizer-preview-provider";
import { ProductImage } from "@/components/product-image";
import { buttonClass } from "@/components/ui/button";
import type { Product } from "@/types/product";

export function ProductCustomizationFlow({ product, previewAvailable }: { product: Product; previewAvailable: boolean }) {
  const [preview, setPreview] = useState<CustomizerPreview | null>(null);
  const [confirmationError, setConfirmationError] = useState<string | null>(null);
  const { confirmPreview } = useCustomizerPreview();
  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];

  const handlePreviewChange = useCallback((nextPreview: CustomizerPreview | null) => {
    setPreview(nextPreview);
    setConfirmationError(null);
  }, []);

  function handleContinue(event: MouseEvent<HTMLAnchorElement>) {
    if (confirmPreview(preview)) return;
    event.preventDefault();
    setConfirmationError("No fue posible conservar el PNG para el cotizador. Genera la previsualización de nuevo.");
  }

  return (
    <main className="min-h-screen">
      <div className="page-container py-8 sm:py-12">
        <Link href={`/producto/${product.slug}`} className="font-technical inline-flex min-h-11 items-center text-xs uppercase underline underline-offset-4">
          ← Volver al producto
        </Link>

        <header className="mt-4 border-t border-[var(--ink)] py-7">
          <p className="eyebrow">Paso 1 de 2 / previsualización local</p>
          <h1 className="mt-4 max-w-4xl break-words text-[clamp(2.1rem,6vw,4.5rem)] leading-[.98]">
            {previewAvailable ? `Personaliza ${product.name}` : `Previsualización para ${product.name}`}
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            {previewAvailable
              ? "Ajusta una simulación visual en este navegador. El archivo no se guarda ni se envía automáticamente."
              : "La herramienta solo se habilita con un mockup y un área imprimible aprobados. Puedes continuar al cotizador sin un PNG."}
          </p>
        </header>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(15rem,.35fr)_minmax(0,1fr)] lg:items-start">
          <aside className="min-w-0 border border-[var(--ink)] bg-[var(--stone-low)] p-4 lg:sticky lg:top-24" aria-label="Producto seleccionado">
            <div className="relative aspect-[4/3] overflow-hidden border border-[var(--line)] bg-white">
              <ProductImage
                src={primaryImage?.src ?? null}
                alt={primaryImage?.alt ?? product.name}
                sizes="(max-width: 1023px) calc(100vw - 4rem), 320px"
              />
            </div>
            <p className="eyebrow mt-4">Producto seleccionado</p>
            <h2 className="mt-2 text-2xl leading-tight">{product.name}</h2>
            {product.sku ? <p className="font-technical mt-2 text-xs uppercase text-[var(--muted)]">Ref. {product.sku}</p> : null}
          </aside>

          <div className="min-w-0">
            <ProductCustomizer productSlug={product.slug} onPreviewChange={handlePreviewChange} />
          </div>
        </div>

        <section className="mt-6 border border-[var(--ink)] bg-white p-5 sm:p-7" aria-labelledby="continue-title">
          <p className="eyebrow">Paso 2 de 2 / confirmar</p>
          <div className="mt-3 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <h2 id="continue-title" className="text-2xl">
                {preview ? "Previsualización lista" : "Continúa cuando estés listo"}
              </h2>
              {preview ? (
                <p className="mt-2 break-all text-sm leading-6 text-[var(--muted)]" aria-live="polite">
                  {preview.sourceFileName} · {preview.width.toLocaleString("es-CO")} × {preview.height.toLocaleString("es-CO")} px. El PNG se conservará solo mientras esta pestaña permanezca abierta.
                </p>
              ) : (
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]" aria-live="polite">
                  La previsualización no es obligatoria. Puedes continuar al cotizador sin un PNG.
                </p>
              )}
            </div>
            <Link
              href={`/cotizador?producto=${product.slug}`}
              onClick={handleContinue}
              className={buttonClass("secondary", "min-h-14 w-full sm:w-auto")}
            >
              {preview ? "Confirmar y continuar" : "Continuar al cotizador"}
            </Link>
          </div>
          {confirmationError ? <p role="alert" className="mt-4 text-sm font-semibold text-[var(--color-error)]">{confirmationError}</p> : null}
        </section>
      </div>
    </main>
  );
}

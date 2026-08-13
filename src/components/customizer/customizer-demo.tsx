"use client";

import { useState } from "react";
import { DemoProductCustomizer } from "@/components/customizer/demo-product-customizer";
import { ProductCustomizer } from "@/components/customizer/product-customizer";
import { CUSTOMIZER_PRODUCT_SUPPORT } from "@/data/customizer/supported-products";
import type { CustomizerPreview } from "@/types/customizer";

export function CustomizerDemo() {
  const [productSlug, setProductSlug] = useState<string>(
    CUSTOMIZER_PRODUCT_SUPPORT[0].productSlug,
  );
  const [preview, setPreview] = useState<CustomizerPreview | null>(null);

  return (
    <div>
      <aside className="mb-6 border-l-4 border-[var(--signal)] bg-white p-4" role="note">
        <p className="font-semibold">Ruta aislada de verificación</p>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          Usa un fixture técnico neutral y con marca de agua. No es un mockup comercial, no confirma el área imprimible y no debe conectarse al catálogo.
        </p>
      </aside>

      <label htmlFor="demo-product" className="font-technical text-xs font-semibold uppercase tracking-[.05em]">
        Slug real para probar el contrato
      </label>
      <select
        id="demo-product"
        value={productSlug}
        onChange={(event) => {
          setPreview(null);
          setProductSlug(event.target.value);
        }}
        className="mt-2 min-h-12 w-full border border-[var(--line)] bg-white px-3 sm:max-w-xl"
      >
        {CUSTOMIZER_PRODUCT_SUPPORT.map((product) => (
          <option key={product.productSlug} value={product.productSlug}>
            {product.productName} · {product.productSlug}
          </option>
        ))}
      </select>

      <div className="mt-6">
        <DemoProductCustomizer
          key={productSlug}
          productSlug={productSlug}
          onPreviewChange={setPreview}
        />
      </div>

      <section aria-live="polite" className="mt-6 border border-[var(--line-soft)] bg-white p-4">
        <h2 className="text-lg">Contrato emitido</h2>
        {preview ? (
          <dl className="mt-3 grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
            <dt className="font-semibold">Slug</dt><dd className="min-w-0 break-all">{preview.productSlug}</dd>
            <dt className="font-semibold">Archivo origen</dt><dd className="min-w-0 break-all">{preview.sourceFileName}</dd>
            <dt className="font-semibold">Formato</dt><dd>{preview.previewBlob.type}</dd>
            <dt className="font-semibold">Dimensiones</dt><dd>{preview.width} × {preview.height} px</dd>
          </dl>
        ) : (
          <p className="mt-2 text-sm text-[var(--muted)]">El callback ha emitido null.</p>
        )}
      </section>

      <details className="mt-6 border border-[var(--line-soft)] bg-white p-4">
        <summary className="cursor-pointer font-semibold">Ver guardas del componente público</summary>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <ProductCustomizer productSlug={productSlug} />
          <ProductCustomizer productSlug="producto-no-soportado" />
        </div>
      </details>
    </div>
  );
}

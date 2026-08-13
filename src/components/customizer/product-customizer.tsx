"use client";

import { useEffect, useId } from "react";
import {
  getApprovedCustomizerTemplate,
  getCustomizerProductSupport,
} from "@/data/customizer/supported-products";
import type { ProductCustomizerProps } from "@/types/customizer";
import { CustomizerWorkspace } from "./customizer-workspace";

export function ProductCustomizer({
  productSlug,
  onPreviewChange,
}: ProductCustomizerProps) {
  const headingId = useId();
  const support = getCustomizerProductSupport(productSlug);
  const template = getApprovedCustomizerTemplate(productSlug);

  useEffect(() => {
    if (!template) onPreviewChange?.(null);
  }, [onPreviewChange, productSlug, template]);

  if (!support) {
    return (
      <section className="border border-[var(--line-soft)] bg-white p-5" aria-labelledby={headingId}>
        <p className="eyebrow">Personalización no disponible</p>
        <h2 id={headingId} className="mt-2 text-2xl">Este producto no admite previsualización</h2>
        <p className="mt-3 text-sm text-[var(--muted)]">
          El personalizador solo se habilita mediante una lista explícita de referencias aprobadas.
        </p>
      </section>
    );
  }

  if (!template) {
    return (
      <section className="border border-[var(--line-soft)] bg-white p-5" aria-labelledby={headingId}>
        <p className="eyebrow">Previsualización orientativa</p>
        <h2 id={headingId} className="mt-2 text-2xl">Plantilla visual pendiente para {support.productName}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Esta referencia está contemplada, pero aún no cuenta con mockup ni área imprimible aprobados. La previsualización comercial permanece bloqueada para no mostrar una forma, escala o acabado inventados.
        </p>
      </section>
    );
  }

  return <CustomizerWorkspace key={template.id} template={template} onPreviewChange={onPreviewChange} />;
}

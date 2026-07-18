"use client";

import { useState } from "react";
import { ProductImage } from "@/components/product-image";
import type { ProductImage as GalleryImage } from "@/types/product";

export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const image = images[active];
  return <div className="grid gap-3 sm:grid-cols-[76px_1fr]">
    {images.length > 1 ? <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col" aria-label="Miniaturas del producto">{images.map((item, index) => <button key={item.id} type="button" onClick={() => setActive(index)} aria-label={`Ver imagen ${index + 1} de ${name}`} aria-pressed={active === index} className={`relative h-18 w-18 shrink-0 overflow-hidden border bg-[var(--surface)] ${active === index ? "border-[var(--ink)]" : "border-[var(--line)]"}`}><ProductImage src={item.src} alt="" sizes="72px" /></button>)}</div> : null}
    <div className="relative order-1 aspect-[4/3] overflow-hidden border border-[var(--line)] bg-[var(--surface)] sm:order-2"><ProductImage src={image?.src ?? null} alt={image?.alt ?? name} priority sizes="(max-width: 1024px) 100vw, 58vw" /></div>
  </div>;
}

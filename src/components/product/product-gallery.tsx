"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { ProductImage } from "@/components/product-image";
import type { ProductImage as GalleryImage } from "@/types/product";

export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = useState(() => {
    const primaryIndex = images.findIndex((image) => image.isPrimary);
    return primaryIndex >= 0 ? primaryIndex : 0;
  });
  const animationFrame = useRef<number | null>(null);
  const pendingOrigin = useRef<{ element: HTMLDivElement; x: number; y: number } | null>(null);
  const image = images[active] ?? images.find((item) => item.isPrimary) ?? images[0];
  const hasMultipleImages = images.length > 1;

  useEffect(() => () => {
    if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
  }, []);

  function updateZoomOrigin(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - bounds.top) / bounds.height) * 100));
    pendingOrigin.current = { element: event.currentTarget, x, y };

    if (animationFrame.current !== null) return;
    animationFrame.current = requestAnimationFrame(() => {
      const origin = pendingOrigin.current;
      if (origin) {
        origin.element.style.setProperty("--zoom-x", `${origin.x}%`);
        origin.element.style.setProperty("--zoom-y", `${origin.y}%`);
      }
      animationFrame.current = null;
    });
  }

  function resetZoomOrigin(event: ReactPointerEvent<HTMLDivElement>) {
    pendingOrigin.current = null;
    if (animationFrame.current !== null) cancelAnimationFrame(animationFrame.current);
    animationFrame.current = null;
    event.currentTarget.style.setProperty("--zoom-x", "50%");
    event.currentTarget.style.setProperty("--zoom-y", "50%");
  }

  return (
    <div className={hasMultipleImages ? "grid gap-3 sm:grid-cols-[76px_minmax(0,1fr)]" : "grid"}>
      {hasMultipleImages ? (
        <div className="order-2 flex gap-2 overflow-x-auto pb-1 sm:order-1 sm:flex-col sm:overflow-visible sm:pb-0" role="group" aria-label="Miniaturas del producto">
          {images.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Ver imagen ${index + 1} de ${name}`}
              aria-controls="product-main-image"
              aria-pressed={active === index}
              className={`relative h-18 w-18 shrink-0 overflow-hidden border bg-[var(--surface)] transition-colors focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--signal)] ${active === index ? "border-[var(--ink)]" : "border-[var(--line-soft)] hover:border-[var(--line)]"}`}
            >
              <ProductImage src={item.src} alt="" sizes="72px" />
            </button>
          ))}
        </div>
      ) : null}

      <div
        id="product-main-image"
        className={`product-gallery__viewport relative order-1 aspect-[4/3] w-full overflow-hidden border border-[var(--line)] bg-[var(--surface)] ${hasMultipleImages ? "sm:order-2" : ""}`}
        onPointerEnter={updateZoomOrigin}
        onPointerMove={updateZoomOrigin}
        onPointerLeave={resetZoomOrigin}
        aria-live="polite"
        aria-atomic="true"
      >
        <ProductImage
          key={image?.id ?? "product-image-unavailable"}
          src={image?.src ?? null}
          alt={image?.alt ?? name}
          preload
          sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) calc(100vw - 3rem), (max-width: 1365px) 57vw, 738px"
          className="product-gallery__image object-contain"
        />
      </div>
    </div>
  );
}

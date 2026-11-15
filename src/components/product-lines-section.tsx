"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import type { ProductLine } from "@/data/product-lines";

export function ProductLinesSection({ lines }: { lines: readonly ProductLine[] }) {
  const [selectedSlug, setSelectedSlug] = useState(lines[0]?.slug ?? "");
  const selectedLine = lines.find((line) => line.slug === selectedSlug) ?? lines[0];

  if (!selectedLine) return null;

  return (
    <section id="lineas" className="scroll-mt-28" aria-labelledby="product-lines-title">
      <div className="page-container pb-[var(--pp-section-y)]">
        <div className="grid items-end gap-7 border-t-4 border-[var(--pp-navy)] pt-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,34rem)]">
          <div>
            <p className="eyebrow">Catálogo Propagplast</p>
            <h2 id="product-lines-title" className="mt-4 [font-size:var(--pp-display-2)]">Nuestras líneas</h2>
          </div>
          <p className="max-w-[48ch] text-base italic leading-7 text-[var(--pp-navy-700)] lg:justify-self-end">
            Selecciona una línea para conocer sus referencias, opciones de personalización y cantidades disponibles.
          </p>
        </div>

        <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {lines.map((line, index) => {
            const selected = line.slug === selectedLine.slug;

            return (
              <Link
                key={line.id}
                href={line.href}
                aria-current={selected ? "true" : undefined}
                onClick={(event) => {
                  if (!selected) {
                    event.preventDefault();
                    setSelectedSlug(line.slug);
                  }
                }}
                className={`group relative flex min-h-72 flex-col overflow-hidden border bg-[var(--pp-paper-cool)] p-4 outline-none transition-[border-color,background-color,transform] duration-[var(--pp-dur)] ease-[var(--pp-ease)] hover:-translate-y-1 hover:border-[var(--pp-cyan)] focus-visible:border-[var(--pp-cyan)] focus-visible:ring-4 focus-visible:ring-[var(--pp-cyan-pale)] ${selected ? "border-[var(--pp-cyan)] bg-[var(--pp-paper-tint)]" : "border-[var(--pp-line)]"}`}
              >
                <span className="font-technical flex items-center justify-between text-[.65rem] uppercase tracking-[var(--pp-tracking-label)] text-[var(--pp-cyan-700)]">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>{selected ? "Seleccionada" : "Seleccionar"}</span>
                </span>
                <div className="relative mt-4 aspect-[4/3] overflow-hidden" aria-hidden="true">
                  <Image src={line.illustrationSrc} alt="" fill sizes="(max-width: 640px) calc(100vw - 72px), (max-width: 1280px) 42vw, 18vw" className="object-contain transition-transform duration-[var(--pp-dur)] ease-[var(--pp-ease)] group-hover:scale-[1.025]" />
                </div>
                <div className="mt-auto flex items-end justify-between gap-3 border-t border-[var(--pp-line)] pt-4">
                  <h3 className="font-display text-2xl uppercase leading-none">{line.name}</h3>
                  <span className="font-technical text-sm text-[var(--pp-cyan)]" aria-hidden="true">→</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-7 flex flex-col gap-5 border-y border-[var(--pp-line)] py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[var(--pp-navy-700)]">Selecciona una línea para llevarla a la cotización.</p>
            <p className="mt-1 font-display text-2xl uppercase text-[var(--pp-navy)]" aria-live="polite">{selectedLine.name}</p>
          </div>
          <Link href={selectedLine.href} className="font-technical inline-flex min-h-12 items-center justify-center border border-[var(--pp-cyan)] bg-[var(--pp-cyan)] px-6 text-xs uppercase tracking-[var(--pp-tracking-button)] !text-white transition-colors hover:border-[var(--pp-cyan-600)] hover:bg-[var(--pp-cyan-600)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--pp-cyan-pale)]">
            Cotizar esta línea →
          </Link>
        </div>
      </div>

      <div className="bg-[var(--pp-navy)] py-10 text-white">
        <div className="page-container flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-display text-[clamp(1.8rem,3.2vw,3.35rem)] uppercase leading-[.95]">Cinco líneas promocionales, una misma identidad de marca.</p>
            <p className="mt-3 max-w-[62ch] text-[var(--pp-cyan-light)]">Personaliza tu producto y solicita la cotización directamente por WhatsApp.</p>
          </div>
          <Link href="/catalogo" className="font-technical inline-flex min-h-12 shrink-0 items-center justify-center border border-[var(--pp-cyan-light)] px-6 text-xs uppercase tracking-[var(--pp-tracking-button)] text-white transition-colors hover:bg-[var(--pp-navy-700)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--pp-cyan-light)]">
            Ver catálogo completo →
          </Link>
        </div>
      </div>
    </section>
  );
}

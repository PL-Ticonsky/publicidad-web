"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { keychainShapes, type KeychainShapeGroup } from "@/data/keychain-shapes";

const filters = ["Todas", "Geométricos", "Troquel a medida", "Con función"] as const;
type ShapeFilter = (typeof filters)[number];

export function KeychainShapeGallery() {
  const [filter, setFilter] = useState<ShapeFilter>("Todas");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const visibleShapes = useMemo(
    () => keychainShapes.filter((shape) => filter === "Todas" || shape.group === (filter as KeychainShapeGroup)),
    [filter],
  );
  const selectedShape = keychainShapes.find((shape) => shape.id === selectedId);
  const quoteHref = {
    pathname: "/cotizador",
    query: {
      producto: "llavero-acrilico-personalizado",
      forma: selectedShape?.id ?? "troquel-a-medida",
    },
  };

  return (
    <section id="formas" className="home-section home-shapes" aria-labelledby="keychain-shapes-title">
      <div className="home-section-heading">
        <h2 id="keychain-shapes-title">Formas de llavero</h2>
        <p>Elige una forma del inventario o mándanos el arte: hacemos el troquel a medida sin costo desde 500 unidades.</p>
      </div>

      <div className="shape-filters" aria-label="Filtrar formas de llavero">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            className="shape-filter"
            data-active={filter === item ? "true" : undefined}
            aria-pressed={filter === item}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="shape-grid" aria-live="polite">
        {visibleShapes.map((shape) => {
          const selected = shape.id === selectedId;
          return (
            <button
              key={shape.id}
              type="button"
              className="shape-tile"
              data-selected={selected ? "true" : undefined}
              aria-pressed={selected}
              onClick={() => setSelectedId(shape.id)}
            >
              <svg viewBox="0 0 100 100" width="76" height="76" aria-hidden="true">
                <path d={shape.path} />
                <circle cx="50" cy={shape.holeY} r="4.4" />
              </svg>
              <span>{shape.name}</span>
              {selected ? <strong>Elegida</strong> : null}
            </button>
          );
        })}
      </div>

      <div className="shape-selection">
        <p aria-live="polite">{selectedShape ? `Forma elegida: ${selectedShape.name}.` : "Toca una forma para llevarla a la cotización."}</p>
        <Link href={quoteHref}>Cotizar esta forma →</Link>
      </div>

      <div className="shape-cross-sell">
        <p>
          El llavero es apenas una línea: la misma planta produce <strong>mousepads, canecas, manillas y portavasos</strong> con la misma marcación y en el mismo despacho.
        </p>
        <Link href="/#catalogo">Ver las 5 líneas →</Link>
      </div>
    </section>
  );
}

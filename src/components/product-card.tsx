import Image from "next/image";
import Link from "next/link";

import { formatCOP } from "@/lib/format";
import type { CatalogoProducto } from "@/types/producto";

const allowedImageHosts = new Set([
  "lxpwllskdsjhlccgjcrg.supabase.co",
  "via.placeholder.com",
]);

function getValidImageUrl(value: string | null): string | null {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value);

    return url.protocol === "https:" && allowedImageHosts.has(url.hostname)
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function ProductCard({ producto }: { producto: CatalogoProducto }) {
  const imageUrl = getValidImageUrl(producto.imagen_principal);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70 shadow-2xl shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-amber-400/40">
      <Link
        href={`/producto/${producto.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-zinc-800"
        aria-label={`Ver ${producto.nombre}`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={producto.nombre}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-zinc-500">
            <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" aria-hidden="true">
              <path d="m4 16 4.5-4.5 3 3L14 12l6 6M4 5h16v14H4V5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <circle cx="15.5" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.4" />
            </svg>
            <span className="text-sm font-medium">Sin imagen</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
          {producto.categoria}
        </p>
        <h2 className="text-xl font-semibold leading-snug text-white">
          <Link href={`/producto/${producto.slug}`} className="transition hover:text-amber-300">
            {producto.nombre}
          </Link>
        </h2>
        {producto.descripcion ? (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">
            {producto.descripcion}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <div>
            <p className="text-xs text-zinc-500">Pedido mínimo</p>
            <p className="mt-1 text-sm font-medium text-zinc-200">
              {producto.cantidad_minima.toLocaleString("es-CO")} unidades
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500">Desde</p>
            <p className="mt-1 text-lg font-bold text-white">
              {producto.precio_desde !== null
                ? formatCOP(producto.precio_desde)
                : "Por cotizar"}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

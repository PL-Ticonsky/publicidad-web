import Image from "next/image";
import Link from "next/link";

import { ProductQuoteCalculator } from "@/components/product-quote-calculator";
import { formatCOP } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import type {
  AdicionalProducto,
  CustomizacionProducto,
  ImagenProducto,
  ProductoDetalle,
  TierPrecio,
  TipoCobroAdicional,
} from "@/types/producto";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function numberValue(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeImages(value: unknown): ImagenProducto[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item, index) => {
    if (!isRecord(item)) return [];
    const id = stringValue(item.id);
    const url = stringValue(item.url_imagen);
    if (!id || !url) return [];

    return [{
      id,
      url_imagen: url,
      texto_alt: stringValue(item.texto_alt),
      es_principal: item.es_principal === true,
      orden: numberValue(item.orden) ?? index,
    }];
  });
}

function normalizeTiers(value: unknown): TierPrecio[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const id = stringValue(item.id);
    const minimum = numberValue(item.cantidad_minima);
    const price = numberValue(item.precio_unitario);
    if (!id || minimum === null || price === null) return [];

    return [{
      id,
      cantidad_minima: minimum,
      cantidad_maxima: numberValue(item.cantidad_maxima),
      precio_unitario: price,
    }];
  }).sort((a, b) => a.cantidad_minima - b.cantidad_minima);
}

function normalizeCustomizations(value: unknown): CustomizacionProducto[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const customizationId = stringValue(item.customizacion_id);
    const possibleId = stringValue(item.customizacion_posible_id);
    const name = stringValue(item.nombre);
    if (!customizationId || !possibleId || !name) return [];

    return [{
      customizacion_id: customizationId,
      customizacion_posible_id: possibleId,
      nombre: name,
      descripcion: stringValue(item.descripcion),
      costo_fijo: numberValue(item.costo_fijo) ?? 0,
      costo_unitario_extra: numberValue(item.costo_unitario_extra) ?? 0,
      colores_maximos: numberValue(item.colores_maximos),
      es_default: item.es_default === true,
    }];
  });
}

function isChargeType(value: unknown): value is TipoCobroAdicional {
  return value === "fijo" || value === "por_unidad" || value === "porcentaje";
}

function normalizeAdditionals(value: unknown): AdicionalProducto[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const id = stringValue(item.id);
    const name = stringValue(item.nombre);
    const price = numberValue(item.precio);
    if (!id || !name || price === null || !isChargeType(item.tipo_cobro)) return [];

    return [{
      id,
      nombre: name,
      descripcion: stringValue(item.descripcion),
      precio: price,
      tipo_cobro: item.tipo_cobro,
    }];
  });
}

function normalizeDetail(data: unknown): ProductoDetalle | null {
  const rpcValue = Array.isArray(data) ? data[0] : data;
  if (!isRecord(rpcValue)) return null;

  const raw = isRecord(rpcValue.producto)
    ? { ...rpcValue.producto, ...rpcValue }
    : rpcValue;
  const category = isRecord(raw.categoria) ? raw.categoria : null;
  const id = stringValue(raw.id);
  const name = stringValue(raw.nombre);
  const slug = stringValue(raw.slug);
  const categoryId = stringValue(category?.id);
  const categoryName = stringValue(category?.nombre);
  const categorySlug = stringValue(category?.slug);

  if (!id || !name || !slug || !categoryId || !categoryName || !categorySlug) {
    return null;
  }

  return {
    id,
    nombre: name,
    slug,
    sku: stringValue(raw.sku),
    descripcion: stringValue(raw.descripcion),
    cantidad_minima: numberValue(raw.cantidad_minima) ?? 1,
    destacado: raw.destacado === true,
    categoria: { id: categoryId, nombre: categoryName, slug: categorySlug },
    imagenes: normalizeImages(raw.imagenes),
    tiers_precio: normalizeTiers(raw.tiers_precio),
    customizaciones: normalizeCustomizations(raw.customizaciones),
    adicionales: normalizeAdditionals(raw.adicionales),
  };
}

const allowedImageHosts = new Set([
  "lxpwllskdsjhlccgjcrg.supabase.co",
  "via.placeholder.com",
]);

function validImageUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && allowedImageHosts.has(url.hostname)
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function EmptyState({ error = false }: { error?: boolean }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0d0e] px-5 text-white">
      <div className="max-w-lg rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
        <h1 className="text-2xl font-bold">
          {error ? "No pudimos cargar el producto" : "Producto no encontrado"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          {error
            ? "Intenta nuevamente en unos minutos."
            : "El producto que buscas no está disponible o cambió de dirección."}
        </p>
        <Link href="/catalogo" className="mt-7 inline-flex rounded-full bg-amber-400 px-6 py-3 font-semibold text-zinc-950">
          Volver al catálogo
        </Link>
      </div>
    </main>
  );
}

export default async function ProductPage({ params }: PageProps<"/producto/[slug]">) {
  const { slug } = await params;
  const { data, error } = await supabase.rpc("get_producto_detalle", { p_slug: slug });

  if (error) {
    console.error("Error cargando producto:", error);
    return <EmptyState error />;
  }

  const detail = normalizeDetail(data);
  if (!detail) return <EmptyState />;

  const images = detail.imagenes
    .map((item) => ({ ...item, validUrl: validImageUrl(item.url_imagen) }))
    .filter((item): item is typeof item & { validUrl: string } => item.validUrl !== null)
    .sort((a, b) => Number(b.es_principal) - Number(a.es_principal) || a.orden - b.orden);

  return (
    <main className="min-h-screen bg-[#0b0d0e] text-white">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
        <Link href="/catalogo" className="text-sm font-medium text-zinc-400 transition hover:text-amber-400">
          ← Volver al catálogo
        </Link>

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.72fr)]">
          <div>
            {images.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 ${index === 0 ? "aspect-[4/3] sm:col-span-2" : "aspect-[4/3]"}`}
                  >
                    <Image
                      src={image.validUrl}
                      alt={image.texto_alt ?? detail.nombre}
                      fill
                      sizes={index === 0 ? "(max-width: 1024px) 100vw, 60vw" : "(max-width: 640px) 100vw, 30vw"}
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 text-sm font-medium text-zinc-500">
                Sin imagen
              </div>
            )}

            <div className="mt-9">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                {detail.categoria.nombre}
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">{detail.nombre}</h1>
              {detail.descripcion ? (
                <p className="mt-5 max-w-3xl text-base leading-7 text-zinc-400">{detail.descripcion}</p>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                {detail.sku ? (
                  <span className="rounded-full border border-white/10 px-4 py-2 text-zinc-400">SKU: {detail.sku}</span>
                ) : null}
                <span className="rounded-full border border-white/10 px-4 py-2 text-zinc-400">
                  Mínimo: {detail.cantidad_minima.toLocaleString("es-CO")} unidades
                </span>
              </div>
            </div>

            <section className="mt-12">
              <h2 className="text-2xl font-semibold">Precios por volumen</h2>
              {detail.tiers_precio.length ? (
                <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white/[0.04] text-zinc-400">
                      <tr><th className="px-5 py-4 font-medium">Cantidad</th><th className="px-5 py-4 text-right font-medium">Precio unitario</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {detail.tiers_precio.map((tier) => (
                        <tr key={tier.id}>
                          <td className="px-5 py-4 text-zinc-300">
                            {tier.cantidad_minima.toLocaleString("es-CO")} – {tier.cantidad_maxima?.toLocaleString("es-CO") ?? "en adelante"}
                          </td>
                          <td className="px-5 py-4 text-right font-semibold">{formatCOP(tier.precio_unitario)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-4 text-sm text-zinc-500">Precio disponible bajo cotización.</p>
              )}
            </section>
          </div>

          <aside className="lg:sticky lg:top-6">
            <ProductQuoteCalculator detalle={detail} />
          </aside>
        </div>
      </div>
    </main>
  );
}

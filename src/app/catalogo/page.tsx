import type { Metadata } from "next";
import { connection } from "next/server";

import { ProductCard } from "@/components/product-card";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { CatalogoProducto } from "@/types/producto";

export const metadata: Metadata = {
  title: "Catálogo de productos | Promocionales para empresas",
  description:
    "Explora productos promocionales y soluciones de publicidad física para tu empresa.",
};

export default async function CatalogoPage() {
  await connection();

  const { data, error } = isSupabaseConfigured
    ? await supabase.rpc("get_catalogo_productos")
    : { data: null, error: new Error("Supabase no está configurado") };
  const productos = (data ?? []) as CatalogoProducto[];

  return (
    <main className="min-h-screen bg-[#0b0d0e] text-white">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.12),_transparent_32%)]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-amber-400">
            <span className="h-px w-9 bg-amber-400" />
            Catálogo corporativo
          </div>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Productos que hacen visible tu marca
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            Soluciones promocionales para campañas, eventos y equipos. Selecciona un producto y conoce sus opciones de personalización y precios por volumen.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-500">Portafolio disponible</p>
            <p className="mt-1 text-lg font-semibold text-zinc-200">
              {productos.length} {productos.length === 1 ? "producto" : "productos"}
            </p>
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/5 px-6 py-10 text-center">
            <h2 className="text-lg font-semibold text-white">No pudimos cargar el catálogo</h2>
            <p className="mt-2 text-sm text-zinc-400">Intenta nuevamente en unos minutos.</p>
          </div>
        ) : productos.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center">
            <h2 className="text-lg font-semibold">Estamos preparando el catálogo</h2>
            <p className="mt-2 text-sm text-zinc-400">Pronto encontrarás aquí nuestros productos.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productos.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

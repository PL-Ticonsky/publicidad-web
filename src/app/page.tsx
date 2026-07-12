import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Publicidad física personalizada para empresas",
  description:
    "Artículos promocionales personalizados y regalos corporativos para empresas en Colombia.",
};

const pasos = [
  {
    numero: "01",
    titulo: "Elige productos",
    descripcion:
      "Explora el catálogo y encuentra los artículos adecuados para tu campaña o equipo.",
  },
  {
    numero: "02",
    titulo: "Personaliza tu cotización",
    descripcion:
      "Define cantidades, opciones de personalización y adicionales según tu necesidad.",
  },
  {
    numero: "03",
    titulo: "Finaliza por WhatsApp",
    descripcion:
      "Un asesor comercial revisa tu solicitud y te acompaña hasta cerrar el pedido.",
  },
];

const beneficios = [
  "Artículos corporativos",
  "Personalización por volumen",
  "Atención comercial en Colombia",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0b0d0e] text-white">
      <section className="relative border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(245,158,11,0.16),_transparent_30%)]" />
        <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_0.7fr] lg:px-10">
          <div>
            <div className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-amber-400">
              <span className="h-px w-9 bg-amber-400" />
              Promocionales para empresas
            </div>
            <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Publicidad física personalizada para empresas
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
              Cotiza artículos promocionales como llaveros, mouse pads, mugs,
              textiles y regalos corporativos. Arma tu cotización online y
              finaliza la atención por WhatsApp.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/catalogo"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-amber-400 px-7 font-semibold text-zinc-950 transition hover:bg-amber-300"
              >
                Ver catálogo
              </Link>
              <Link
                href="#como-funciona"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-7 font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
              >
                Cómo funciona
              </Link>
            </div>
          </div>

          <div className="hidden lg:block" aria-hidden="true">
            <div className="relative mx-auto aspect-square max-w-md rounded-full border border-white/10">
              <div className="absolute inset-12 rounded-full border border-amber-400/30" />
              <div className="absolute inset-24 rounded-full bg-amber-400/10 shadow-[0_0_100px_rgba(245,158,11,0.18)]" />
              <div className="absolute left-0 top-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-amber-400" />
              <div className="absolute right-[14%] top-[8%] h-2 w-2 rounded-full bg-zinc-400" />
            </div>
          </div>
        </div>
      </section>

      <section
        id="como-funciona"
        className="scroll-mt-8 border-b border-white/10 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
            Proceso simple
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Cómo funciona
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {pasos.map((paso) => (
              <article
                key={paso.numero}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-7"
              >
                <p className="text-sm font-bold text-amber-400">{paso.numero}</p>
                <h3 className="mt-7 text-xl font-semibold">{paso.titulo}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  {paso.descripcion}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
            {beneficios.map((beneficio) => (
              <div
                key={beneficio}
                className="flex items-center gap-4 bg-zinc-950 px-6 py-7"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/10 text-amber-400">
                  ✓
                </span>
                <p className="font-medium text-zinc-200">{beneficio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

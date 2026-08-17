import type { Metadata } from "next";
import { CustomizerDemo } from "@/components/customizer/customizer-demo";

export const metadata: Metadata = {
  title: "Demo técnica del personalizador",
  robots: { index: false, follow: false },
};

export default function CustomizerDemoPage() {
  return (
    <main className="page-container flex-1 py-[var(--pp-section-y)]">
      <p className="eyebrow">Herramienta removible de desarrollo</p>
      <h1 className="mt-4 [font-size:var(--pp-display-2)]">Demo técnica del personalizador</h1>
      <p className="mt-4 max-w-3xl leading-7 text-[var(--muted)]">
        Verifica carga, transformación, recorte, exportación y limpieza local sin integrar el personalizador al cotizador ni a las rutas de producto.
      </p>
      <div className="mt-8"><CustomizerDemo /></div>
    </main>
  );
}

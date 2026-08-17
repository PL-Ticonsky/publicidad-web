import { ButtonLink } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-5">
      <div className="max-w-lg border-y border-[var(--pp-line)] bg-white p-10 text-center">
        <p className="eyebrow">Error de catálogo</p><h1 className="mt-3 text-4xl">Producto no encontrado</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
          El producto que buscas no está disponible o cambió de dirección.
        </p>
        <ButtonLink href="/catalogo" className="mt-7">Volver al catálogo</ButtonLink>
      </div>
    </main>
  );
}

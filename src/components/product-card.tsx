import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { ArrowRightIcon, ImageIcon } from "@/components/ui/icons";
import { getCategoryById } from "@/data/categories";
import { formatCOP } from "@/lib/format";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images.find((item) => item.isPrimary) ?? product.images[0];
  const category = getCategoryById(product.categoryId);
  const lowestPrice = product.priceTiers.length
    ? Math.min(...product.priceTiers.map((tier) => tier.unitPrice))
    : null;
  return <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border-default)] bg-white shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-raised)]">
    <Link href={`/producto/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-[var(--color-surface-muted)]" aria-label={`Ver opciones de ${product.name}`}>
      {image ? <ProductImage src={image.src} alt={image.alt} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-contain transition duration-500 group-hover:scale-[1.03]" /> : <div className="flex h-full flex-col items-center justify-center gap-3 text-[var(--color-text-secondary)]"><ImageIcon className="h-11 w-11" /><span className="text-sm font-semibold">Imagen no disponible</span></div>}
    </Link>
    <div className="flex flex-1 flex-col p-5"><p className="text-xs font-extrabold uppercase tracking-[.12em] text-[var(--color-brand-accent-hover)]">{category?.name ?? "Producto"}</p><h2 className="mt-2 text-lg font-extrabold leading-snug text-[var(--color-brand-primary)]"><Link href={`/producto/${product.slug}`}>{product.name}</Link></h2><p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-text-secondary)]">{product.shortDescription}</p><div className="mt-auto grid grid-cols-2 gap-3 pt-6"><div><p className="text-xs text-[var(--color-text-secondary)]">Pedido mínimo</p><p className="mt-1 text-sm font-bold text-[var(--color-text-primary)]">{product.minimumQuantity.toLocaleString("es-CO")} uds.</p></div><div className="text-right"><p className="text-xs text-[var(--color-text-secondary)]">Valor estimado desde</p><p className="mt-1 text-base font-extrabold text-[var(--color-brand-primary)]">{lowestPrice !== null ? formatCOP(lowestPrice) : "Por validar"}</p></div></div><Link href={`/producto/${product.slug}`} className="mt-5 flex min-h-11 items-center justify-between border-t border-[var(--color-border-default)] pt-4 text-sm font-extrabold text-[var(--color-brand-primary)]">Ver opciones <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-1" /></Link></div>
  </article>;
}

import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { getCategoryById } from "@/data/categories";
import { getTechniquesByIds } from "@/data/techniques";
import { formatCOP } from "@/lib/format";
import type { Product } from "@/types/product";

export function ProductCard({ product }: { product: Product }) {
  const image = product.images.find((item) => item.isPrimary) ?? product.images[0];
  const category = getCategoryById(product.categoryId);
  const techniqueNames = getTechniquesByIds(product.availableTechniqueIds).map((technique) => technique.name);
  const lowestPrice = product.priceTiers.length
    ? Math.min(...product.priceTiers.map((tier) => tier.unitPrice))
    : null;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white transition-[transform,box-shadow,border-color] duration-[400ms] ease-[var(--pp-ease)] hover:-translate-y-1 hover:border-[var(--pp-cyan)] hover:shadow-[var(--pp-shadow-card)]">
      <Link href={`/producto/${product.slug}`} className="halftone relative block aspect-[5/4] overflow-hidden bg-[var(--pp-paper-cool)]" aria-label={`Ver opciones de ${product.name}`}>
        <ProductImage src={image?.src ?? null} alt={image?.alt ?? product.name} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-contain p-4 transition-transform duration-[400ms] ease-[var(--pp-ease)] group-hover:scale-[1.035]" />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-[1.125rem]">
        <p className="font-technical text-[.625rem] uppercase tracking-[.18em] text-[var(--pp-cyan)]">{category?.name ?? "Producto"}</p>
        <h2 className="text-[1.35rem] leading-[1.04]"><Link href={`/producto/${product.slug}`}>{product.name}</Link></h2>
        <p className="line-clamp-2 text-sm leading-6 text-[var(--pp-navy-700)]">{product.shortDescription}</p>
        {techniqueNames.length ? (
          <div className="flex flex-wrap gap-1.5">{techniqueNames.slice(0, 2).map((name) => <span key={name} className="rounded-[var(--pp-radius)] bg-[var(--pp-paper-tint)] px-2.5 py-1 text-[.7rem] text-[var(--pp-cyan-700)]">{name}</span>)}</div>
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-4 border-t border-[var(--pp-line)] pt-4">
          <div>
            <p className="font-technical text-[.65rem] uppercase tracking-[.08em] text-[var(--pp-gray)]">Mín. {product.minimumQuantity.toLocaleString("es-CO")} u</p>
            <p className="mt-1 text-xs text-[var(--pp-navy-700)]">Base desde {lowestPrice !== null ? formatCOP(lowestPrice) : "por validar"}</p>
          </div>
          <Link href={`/producto/${product.slug}`} className="font-technical shrink-0 text-[.7rem] uppercase text-[var(--pp-cyan)] hover:text-[var(--pp-cyan-700)]">Ver producto →</Link>
        </div>
      </div>
    </article>
  );
}

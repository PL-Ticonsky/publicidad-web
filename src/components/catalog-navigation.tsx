import Link from "next/link";
import { getAllCategories } from "@/data/categories";

export function CatalogNavigation({ activeSlug }: { activeSlug?: string }) {
  const categories = getAllCategories();
  return (
    <nav aria-label="Filtrar catálogo por categoría" className="flex flex-wrap gap-2.5">
      <Link href="/catalogo" aria-current={!activeSlug ? "page" : undefined} className={`relative border px-4 py-2.5 font-technical text-xs uppercase tracking-[.14em] transition-colors ${!activeSlug ? "border-[var(--pp-cyan)] text-[var(--pp-cyan)] after:absolute after:-inset-x-px after:-bottom-px after:h-1 after:bg-[var(--pp-cyan)]" : "border-[var(--pp-line)] hover:border-[var(--pp-cyan)] hover:text-[var(--pp-cyan)]"}`}>Todo</Link>
      {categories.map((category) => {
        const active = category.slug === activeSlug;
        return <Link key={category.id} href={`/catalogo/${category.slug}`} aria-current={active ? "page" : undefined} className={`relative border px-4 py-2.5 font-technical text-xs uppercase tracking-[.14em] transition-colors ${active ? "border-[var(--pp-cyan)] text-[var(--pp-cyan)] after:absolute after:-inset-x-px after:-bottom-px after:h-1 after:bg-[var(--pp-cyan)]" : "border-[var(--pp-line)] hover:border-[var(--pp-cyan)] hover:text-[var(--pp-cyan)]"}`}>{category.name}</Link>;
      })}
    </nav>
  );
}

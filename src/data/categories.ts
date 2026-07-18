import type { Category } from "@/types/product";

export const categories: readonly Category[] = [
  { id: "textiles", slug: "textiles", name: "Textiles", title: "Productos textiles personalizados", description: "Prendas para equipos, eventos y activaciones." },
  { id: "llaveros", slug: "llaveros", name: "Llaveros", title: "Llaveros corporativos personalizados", description: "Objetos promocionales compactos para uso diario." },
  { id: "tecnologia", slug: "tecnologia", name: "Tecnología", title: "Productos tecnológicos promocionales", description: "Accesorios útiles para oficinas y eventos." },
  { id: "mugs", slug: "mugs", name: "Mugs", title: "Mugs personalizados para tu marca", description: "Regalos corporativos personalizados para cada ocasión." },
  { id: "oficina", slug: "oficina", name: "Oficina", title: "Artículos de oficina personalizados", description: "Artículos funcionales para campañas de alto alcance." },
];

export function getAllCategories(): Category[] {
  return [...categories];
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

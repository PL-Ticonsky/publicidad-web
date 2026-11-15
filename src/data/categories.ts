import type { Category } from "@/types/product";
import { getAllProductLines } from "@/data/product-lines";

export const categories: readonly Category[] = getAllProductLines().map((line) => ({
  id: line.id,
  slug: line.slug,
  name: line.name,
  title: `${line.name} personalizables`,
  description: line.shortDescription,
  image: line.illustrationSrc,
}));

export function getAllCategories(): Category[] {
  return [...categories];
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

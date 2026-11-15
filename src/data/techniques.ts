import type { Technique } from "@/types/product";

export const techniques: readonly Technique[] = [
  { id: "laser-llavero", name: "Grabado láser", description: "Marcación de alta precisión sobre metal", pricingMode: "per-unit", price: 500, setupPrice: 30000, default: true },
  { id: "sublimacion-mouse-pad", name: "Sublimación", description: "Impresión a full color incluida", pricingMode: "included", price: 0, default: true },
  { id: "impresion-uv", name: "Impresión UV", description: "Impresión directa a color sobre superficies rígidas", pricingMode: "per-unit", price: 1200, setupPrice: 30000, default: true },
];

export function getTechniqueById(id: string): Technique | undefined {
  return techniques.find((technique) => technique.id === id);
}

export function getTechniquesByIds(ids: readonly string[]): Technique[] {
  return ids.flatMap((id) => {
    const technique = getTechniqueById(id);
    return technique ? [technique] : [];
  });
}

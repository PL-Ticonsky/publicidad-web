import type { Technique } from "@/types/product";

export const techniques: readonly Technique[] = [
  { id: "dtf-textil", name: "DTF", description: "Impresión textil digital", pricingMode: "per-unit", price: 4500, setupPrice: 25000, default: true },
  { id: "bordado-textil", name: "Bordado", description: "Personalización textil mediante bordado", pricingMode: "per-unit", price: 6500, setupPrice: 45000 },
  { id: "laser-llavero", name: "Grabado láser", description: "Marcación de alta precisión sobre metal", pricingMode: "per-unit", price: 500, setupPrice: 30000, default: true },
  { id: "sublimacion-mouse-pad", name: "Sublimación", description: "Impresión a full color incluida", pricingMode: "included", price: 0, default: true },
  { id: "sublimacion-mug", name: "Sublimación", description: "Impresión a full color incluida", pricingMode: "included", price: 0, default: true },
  { id: "tampografia-boligrafo", name: "Tampografía", description: "Impresión para superficies pequeñas, hasta 2 colores", pricingMode: "per-unit", price: 250, setupPrice: 25000, default: true },
  { id: "laser-usb", name: "Grabado láser", description: "Marcación de alta precisión sobre la memoria", pricingMode: "per-unit", price: 800, setupPrice: 35000, default: true },
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

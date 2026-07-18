import type { ProductAdditional } from "@/types/product";

export const additionals: readonly ProductAdditional[] = [
  { id: "diseno-basico-camiseta", name: "Diseño básico", description: "Ajuste básico de logo o arte final", pricingMode: "fixed", price: 30000 },
  { id: "entrega-urgente-camiseta", name: "Entrega urgente", description: "Prioridad de producción; el asesor validará el recargo", pricingMode: "fixed", price: 0 },
  { id: "empaque-llavero", name: "Empaque individual", description: "Bolsa individual transparente", pricingMode: "per-unit", price: 400 },
  { id: "diseno-basico-mouse-pad", name: "Diseño básico", description: "Ajuste básico del diseño del cliente", pricingMode: "fixed", price: 30000 },
  { id: "empaque-mouse-pad", name: "Empaque individual", description: "Empaque transparente individual", pricingMode: "per-unit", price: 500 },
  { id: "empaque-mug", name: "Empaque individual", description: "Caja individual para entrega corporativa", pricingMode: "per-unit", price: 800 },
  { id: "entrega-urgente-boligrafo", name: "Entrega urgente", description: "Prioridad de producción; el asesor validará el recargo", pricingMode: "fixed", price: 0 },
  { id: "caja-usb", name: "Caja individual", description: "Caja blanca individual para memoria USB", pricingMode: "per-unit", price: 1200 },
];

export function getAdditionalById(id: string): ProductAdditional | undefined {
  return additionals.find((additional) => additional.id === id);
}

export function getAdditionalsByIds(ids: readonly string[]): ProductAdditional[] {
  return ids.flatMap((id) => {
    const additional = getAdditionalById(id);
    return additional ? [additional] : [];
  });
}

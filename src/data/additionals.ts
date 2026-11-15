import type { PricingMode } from "@/types/product";

interface AdditionalBase {
  id: string;
  name: string;
  description?: string;
}

export type ProductAdditional = AdditionalBase & (
  | {
      pricingStatus: "priced";
      pricingMode: Exclude<PricingMode, "included">;
      priceCop: number;
    }
  | {
      pricingStatus: "requiresQuote";
    }
);

export const additionals: readonly ProductAdditional[] = [
  { id: "empaque-llavero", name: "Empaque individual", description: "Bolsa individual transparente", pricingStatus: "priced", pricingMode: "per-unit", priceCop: 400 },
  { id: "diseno-basico-mouse-pad", name: "Diseño básico", description: "Ajuste básico del diseño del cliente", pricingStatus: "priced", pricingMode: "fixed", priceCop: 30000 },
  { id: "empaque-mouse-pad", name: "Empaque individual", description: "Empaque transparente individual", pricingStatus: "priced", pricingMode: "per-unit", priceCop: 500 },
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

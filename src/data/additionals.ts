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
  { id: "diseno-basico-camiseta", name: "Diseño básico", description: "Ajuste básico de logo o arte final", pricingStatus: "priced", pricingMode: "fixed", priceCop: 30000 },
  { id: "entrega-urgente-camiseta", name: "Entrega urgente", description: "Prioridad de producción; el asesor validará el recargo", pricingStatus: "requiresQuote" },
  { id: "empaque-llavero", name: "Empaque individual", description: "Bolsa individual transparente", pricingStatus: "priced", pricingMode: "per-unit", priceCop: 400 },
  { id: "diseno-basico-mouse-pad", name: "Diseño básico", description: "Ajuste básico del diseño del cliente", pricingStatus: "priced", pricingMode: "fixed", priceCop: 30000 },
  { id: "empaque-mouse-pad", name: "Empaque individual", description: "Empaque transparente individual", pricingStatus: "priced", pricingMode: "per-unit", priceCop: 500 },
  { id: "empaque-mug", name: "Empaque individual", description: "Caja individual para entrega corporativa", pricingStatus: "priced", pricingMode: "per-unit", priceCop: 800 },
  { id: "entrega-urgente-boligrafo", name: "Entrega urgente", description: "Prioridad de producción; el asesor validará el recargo", pricingStatus: "requiresQuote" },
  { id: "caja-usb", name: "Caja individual", description: "Caja blanca individual para memoria USB", pricingStatus: "priced", pricingMode: "per-unit", priceCop: 1200 },
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

import type { PriceTier, Product } from "@/types/product";

export interface QuoteInput {
  product: Product;
  quantity: number;
  techniqueId?: string;
  additionalIds: string[];
}

export interface QuoteSelection {
  id: string;
  name: string;
}

export interface ExcludedCharge extends QuoteSelection {
  reason: "requiresQuote" | "productRequiresQuote";
}

export interface QuoteResult {
  status: "complete" | "partial" | "requiresQuote";
  product: {
    id: string;
    slug: string;
    name: string;
    sku?: string;
  };
  quantity: number;
  technique: QuoteSelection | null;
  additionals: Array<QuoteSelection & { pricingStatus: "priced" | "requiresQuote" }>;
  excludedCharges: ExcludedCharge[];
  baseUnitPriceCop: number | null;
  baseSubtotalCop: number | null;
  techniqueCostCop: number | null;
  additionalsCostCop: number | null;
  subtotalCop: number | null;
  taxAmountCop: number | null;
  estimatedTotalCop: number | null;
  selectedTier?: PriceTier;
}

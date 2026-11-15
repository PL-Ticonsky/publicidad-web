export type PricingType = "tiered" | "fixed" | "quote-only";
export type PricingMode = "included" | "per-unit" | "fixed";

export interface ProductImage {
  id: string;
  src: string;
  alt: string;
  isPrimary?: boolean;
}

export interface PriceTier {
  id: string;
  minQuantity: number;
  maxQuantity?: number;
  unitPrice: number;
}

export interface Technique {
  id: string;
  name: string;
  description?: string;
  pricingMode: PricingMode;
  price: number;
  setupPrice?: number;
  default?: boolean;
}

export interface ProductAdditional {
  id: string;
  name: string;
  description?: string;
  pricingMode: Exclude<PricingMode, "included">;
  price: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  title?: string;
  description?: string;
  image?: string;
}

export interface Product {
  id: string;
  sku?: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  images: ProductImage[];
  minimumQuantity: number;
  pricingType: PricingType;
  priceTiers: PriceTier[];
  availableTechniqueIds: string[];
  availableAdditionalIds: string[];
  active: boolean;
}

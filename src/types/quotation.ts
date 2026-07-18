import type { PriceTier, Product } from "@/types/product";

export interface QuoteInput {
  product: Product;
  quantity: number;
  techniqueId?: string;
  additionalIds: string[];
}

export interface QuoteResult {
  status: "estimated" | "quote-only";
  quantity: number;
  baseUnitPrice: number | null;
  techniqueUnitPrice: number | null;
  additionalsUnitPrice: number | null;
  fixedCosts: number | null;
  finalUnitPrice: number | null;
  baseSubtotal: number | null;
  techniqueCost: number | null;
  additionalsCost: number | null;
  subtotal: number | null;
  taxAmount: number | null;
  estimatedTotal: number | null;
  selectedTier?: PriceTier;
}

export interface QuoteContact {
  name: string;
  company: string;
  city: string;
  phone: string;
  email: string;
  comments: string;
  designNotes: string;
}

export interface WhatsAppQuote {
  product: Product;
  quantity: number;
  techniqueName?: string;
  additionalNames: string[];
  contact: QuoteContact;
  result: QuoteResult;
}

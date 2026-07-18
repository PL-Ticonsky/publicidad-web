import { getAdditionalsByIds } from "@/data/additionals";
import { getTechniqueById } from "@/data/techniques";
import { getPriceTier } from "@/lib/quotation/get-price-tier";
import { validateQuotation } from "@/lib/quotation/validate-quotation";
import type { QuoteInput, QuoteResult } from "@/types/quotation";

const IVA_RATE = 0.19;

export class QuoteValidationError extends Error {
  constructor(public readonly errors: string[]) {
    super(errors[0] ?? "La configuración de la cotización no es válida.");
    this.name = "QuoteValidationError";
  }
}

export function calculateQuote(input: QuoteInput): QuoteResult {
  const errors = validateQuotation(input);
  if (errors.length > 0) throw new QuoteValidationError(errors);

  if (input.product.pricingType === "quote-only") {
    return {
      status: "quote-only",
      quantity: input.quantity,
      baseUnitPrice: null,
      techniqueUnitPrice: null,
      additionalsUnitPrice: null,
      fixedCosts: null,
      finalUnitPrice: null,
      baseSubtotal: null,
      techniqueCost: null,
      additionalsCost: null,
      subtotal: null,
      taxAmount: null,
      estimatedTotal: null,
    };
  }

  const selectedTier = getPriceTier(input.product.priceTiers, input.quantity);
  if (!selectedTier) throw new QuoteValidationError(["No hay un tramo de precio disponible para esta cantidad."]);

  const technique = input.techniqueId ? getTechniqueById(input.techniqueId) : undefined;
  const selectedAdditionals = getAdditionalsByIds(input.additionalIds);
  const baseUnitPrice = selectedTier.unitPrice;
  const techniqueUnitPrice = technique?.pricingMode === "per-unit" ? technique.price : 0;
  const techniqueFixedCost =
    (technique?.pricingMode === "fixed" ? technique.price : 0) + (technique?.setupPrice ?? 0);
  const additionalsUnitPrice = selectedAdditionals
    .filter((additional) => additional.pricingMode === "per-unit")
    .reduce((total, additional) => total + additional.price, 0);
  const additionalsFixedCost = selectedAdditionals
    .filter((additional) => additional.pricingMode === "fixed")
    .reduce((total, additional) => total + additional.price, 0);
  const fixedCosts = techniqueFixedCost + additionalsFixedCost;
  const baseSubtotal = baseUnitPrice * input.quantity;
  const techniqueCost = techniqueUnitPrice * input.quantity + techniqueFixedCost;
  const additionalsCost = additionalsUnitPrice * input.quantity + additionalsFixedCost;
  const subtotal = baseSubtotal + techniqueCost + additionalsCost;
  const taxAmount = subtotal * IVA_RATE;

  return {
    status: "estimated",
    quantity: input.quantity,
    baseUnitPrice,
    techniqueUnitPrice,
    additionalsUnitPrice,
    fixedCosts,
    finalUnitPrice: subtotal / input.quantity,
    baseSubtotal,
    techniqueCost,
    additionalsCost,
    subtotal,
    taxAmount,
    estimatedTotal: subtotal + taxAmount,
    selectedTier,
  };
}

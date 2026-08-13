import { getAdditionalsByIds } from "@/data/additionals";
import { getTechniqueById } from "@/data/techniques";
import { getPriceTier } from "@/lib/quotation/get-price-tier";
import { addCop, calculateTaxCop, multiplyCop } from "@/lib/quotation/money-policy";
import type { QuoteInput, QuoteResult } from "@/lib/quotation/types";
import { validateQuotation } from "@/lib/quotation/validate-quotation";

export class QuoteValidationError extends Error {
  constructor(public readonly errors: string[]) {
    super(errors[0] ?? "La configuración de la cotización no es válida.");
    this.name = "QuoteValidationError";
  }
}

export function calculateQuote(input: QuoteInput): QuoteResult {
  const errors = validateQuotation(input);
  if (errors.length > 0) throw new QuoteValidationError(errors);

  const technique = input.techniqueId ? getTechniqueById(input.techniqueId) : undefined;
  const selectedAdditionals = getAdditionalsByIds(input.additionalIds);
  const product = {
    id: input.product.id,
    slug: input.product.slug,
    name: input.product.name,
    ...(input.product.sku ? { sku: input.product.sku } : {}),
  };
  const selection = {
    product,
    quantity: input.quantity,
    technique: technique ? { id: technique.id, name: technique.name } : null,
    additionals: selectedAdditionals.map((additional) => ({
      id: additional.id,
      name: additional.name,
      pricingStatus: additional.pricingStatus,
    })),
  };

  if (input.product.pricingType === "quote-only") {
    return {
      ...selection,
      status: "requiresQuote",
      excludedCharges: [{ id: input.product.id, name: "Precio del producto", reason: "productRequiresQuote" }],
      baseUnitPriceCop: null,
      baseSubtotalCop: null,
      techniqueCostCop: null,
      additionalsCostCop: null,
      subtotalCop: null,
      taxAmountCop: null,
      estimatedTotalCop: null,
    };
  }

  const selectedTier = getPriceTier(input.product.priceTiers, input.quantity);
  if (!selectedTier) throw new QuoteValidationError(["No hay un tramo de precio disponible para esta cantidad."]);

  const pricedAdditionals = selectedAdditionals.filter((additional) => additional.pricingStatus === "priced");
  const excludedCharges = selectedAdditionals
    .filter((additional) => additional.pricingStatus === "requiresQuote")
    .map((additional) => ({ id: additional.id, name: additional.name, reason: "requiresQuote" as const }));
  const baseUnitPriceCop = selectedTier.unitPrice;
  const techniqueUnitPriceCop = technique?.pricingMode === "per-unit" ? technique.price : 0;
  const techniqueFixedCost =
    (technique?.pricingMode === "fixed" ? technique.price : 0) + (technique?.setupPrice ?? 0);
  const additionalsUnitPriceCop = pricedAdditionals
    .filter((additional) => additional.pricingMode === "per-unit")
    .reduce((total, additional) => total + additional.priceCop, 0);
  const additionalsFixedCostCop = pricedAdditionals
    .filter((additional) => additional.pricingMode === "fixed")
    .reduce((total, additional) => total + additional.priceCop, 0);
  const baseSubtotalCop = multiplyCop(baseUnitPriceCop, input.quantity, "El costo base");
  const techniqueCostCop = addCop(
    [multiplyCop(techniqueUnitPriceCop, input.quantity, "La personalización"), techniqueFixedCost],
    "La personalización",
  );
  const additionalsCostCop = addCop(
    [multiplyCop(additionalsUnitPriceCop, input.quantity, "Los adicionales"), additionalsFixedCostCop],
    "Los adicionales",
  );
  const subtotalCop = addCop([baseSubtotalCop, techniqueCostCop, additionalsCostCop], "El subtotal");
  const taxAmountCop = calculateTaxCop(subtotalCop);
  const estimatedTotalCop = addCop([subtotalCop, taxAmountCop], "El total");

  return {
    ...selection,
    status: excludedCharges.length > 0 ? "partial" : "complete",
    excludedCharges,
    baseUnitPriceCop,
    baseSubtotalCop,
    techniqueCostCop,
    additionalsCostCop,
    subtotalCop,
    taxAmountCop,
    estimatedTotalCop,
    selectedTier,
  };
}

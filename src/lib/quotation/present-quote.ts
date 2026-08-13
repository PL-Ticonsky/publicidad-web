import { formatCOP } from "@/lib/format";
import { formatTaxRate } from "@/lib/quotation/money-policy";
import type { QuoteResult } from "@/lib/quotation/types";

export interface QuotePresentationLine {
  id: "base-unit" | "personalization" | "additionals" | "subtotal" | "tax";
  label: string;
  value: string;
}

export interface QuotePresentation {
  heading: "Estimación" | "Estimación parcial" | "Requiere validación";
  lines: QuotePresentationLine[];
  totalLabel: string | null;
  totalValue: string | null;
  excludedCharges: string[];
}

function requiredAmount(value: number | null, field: string): number {
  if (value === null) throw new Error(`El resultado no contiene ${field}.`);
  return value;
}

export function presentQuote(result: QuoteResult): QuotePresentation {
  if (result.status === "requiresQuote") {
    return {
      heading: "Requiere validación",
      lines: [],
      totalLabel: null,
      totalValue: null,
      excludedCharges: result.excludedCharges.map((charge) => charge.name),
    };
  }

  const partial = result.status === "partial";
  return {
    heading: partial ? "Estimación parcial" : "Estimación",
    lines: [
      { id: "base-unit", label: "Precio base por unidad", value: formatCOP(requiredAmount(result.baseUnitPriceCop, "el precio base")) },
      { id: "personalization", label: "Personalización", value: formatCOP(requiredAmount(result.techniqueCostCop, "la personalización")) },
      { id: "additionals", label: partial ? "Adicionales con precio" : "Adicionales", value: formatCOP(requiredAmount(result.additionalsCostCop, "los adicionales")) },
      { id: "subtotal", label: partial ? "Subtotal parcial" : "Subtotal estimado", value: formatCOP(requiredAmount(result.subtotalCop, "el subtotal")) },
      { id: "tax", label: `${partial ? "IVA sobre importes incluidos" : "IVA estimado"} (${formatTaxRate()})`, value: formatCOP(requiredAmount(result.taxAmountCop, "el IVA")) },
    ],
    totalLabel: partial ? "Total parcial (sin cargos por validar)" : "Total estimado",
    totalValue: formatCOP(requiredAmount(result.estimatedTotalCop, "el total")),
    excludedCharges: result.excludedCharges.map((charge) => charge.name),
  };
}

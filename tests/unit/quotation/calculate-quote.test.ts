import { describe, expect, it } from "vitest";

import { calculateQuote, QuoteValidationError } from "@/lib/quotation/calculate-quote";
import { productFixture } from "../../fixtures/quotation";

describe("calculateQuote", () => {
  it("calcula mínimo, técnica por unidad, preparación, IVA y total en COP enteros", () => {
    const result = calculateQuote({
      product: productFixture("camiseta-corporativa-personalizada"),
      quantity: 20,
      techniqueId: "dtf-textil",
      additionalIds: [],
    });

    expect(result).toMatchObject({
      status: "complete",
      baseUnitPriceCop: 32_000,
      baseSubtotalCop: 640_000,
      techniqueCostCop: 115_000,
      additionalsCostCop: 0,
      subtotalCop: 755_000,
      taxAmountCop: 143_450,
      estimatedTotalCop: 898_450,
    });
  });

  it.each([
    [49, "camiseta-20", 32_000],
    [50, "camiseta-50", 28_500],
    [99, "camiseta-50", 28_500],
    [100, "camiseta-100", 25_000],
  ])("aplica el tramo correcto para %i unidades", (quantity, tierId, unitPrice) => {
    const result = calculateQuote({
      product: productFixture("camiseta-corporativa-personalizada"),
      quantity,
      techniqueId: "dtf-textil",
      additionalIds: [],
    });
    expect(result.selectedTier?.id).toBe(tierId);
    expect(result.baseUnitPriceCop).toBe(unitPrice);
  });

  it("soporta técnica incluida y adicionales fijo y por unidad", () => {
    const result = calculateQuote({
      product: productFixture("mouse-pad-personalizado-rectangular"),
      quantity: 50,
      techniqueId: "sublimacion-mouse-pad",
      additionalIds: ["diseno-basico-mouse-pad", "empaque-mouse-pad"],
    });
    expect(result).toMatchObject({
      status: "complete",
      techniqueCostCop: 0,
      additionalsCostCop: 55_000,
      subtotalCop: 530_000,
      taxAmountCop: 100_700,
      estimatedTotalCop: 630_700,
    });
  });

  it("excluye explícitamente un cargo requiresQuote y marca el total como parcial", () => {
    const result = calculateQuote({
      product: productFixture("camiseta-corporativa-personalizada"),
      quantity: 50,
      techniqueId: "dtf-textil",
      additionalIds: ["diseno-basico-camiseta", "entrega-urgente-camiseta"],
    });
    expect(result).toMatchObject({
      status: "partial",
      additionalsCostCop: 30_000,
      subtotalCop: 1_705_000,
      taxAmountCop: 323_950,
      estimatedTotalCop: 2_028_950,
    });
    expect(result.excludedCharges).toEqual([
      expect.objectContaining({ id: "entrega-urgente-camiseta", name: "Entrega urgente" }),
    ]);
  });

  it("redondea el IVA una vez al COP más cercano", () => {
    const result = calculateQuote({
      product: productFixture("libreta-corporativa-personalizada"),
      quantity: 25,
      techniqueId: "tampografia-boligrafo",
      additionalIds: [],
    });
    expect(result.subtotalCop).toBe(581_250);
    expect(result.taxAmountCop).toBe(110_438);
    expect(result.estimatedTotalCop).toBe(691_688);
  });

  it("devuelve requiresQuote sin total para un producto quote-only", () => {
    const source = productFixture("camiseta-corporativa-personalizada");
    const result = calculateQuote({
      product: { ...source, pricingType: "quote-only", priceTiers: [] },
      quantity: 20,
      techniqueId: "dtf-textil",
      additionalIds: [],
    });
    expect(result.status).toBe("requiresQuote");
    expect(result.estimatedTotalCop).toBeNull();
    expect(result.excludedCharges[0]?.reason).toBe("productRequiresQuote");
  });

  it("rechaza fixed porque el modelo no tiene una regla comercial aprobada", () => {
    const source = productFixture("camiseta-corporativa-personalizada");
    expect(() => calculateQuote({
      product: { ...source, pricingType: "fixed" },
      quantity: 20,
      techniqueId: "dtf-textil",
      additionalIds: [],
    })).toThrow(QuoteValidationError);
  });
});

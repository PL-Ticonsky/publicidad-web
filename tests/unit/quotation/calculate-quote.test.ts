import { describe, expect, it } from "vitest";

import { calculateQuote, QuoteValidationError } from "@/lib/quotation/calculate-quote";
import { productFixture } from "../../fixtures/quotation";

describe("calculateQuote", () => {
  it("calcula mínimo, técnica por unidad, preparación, IVA y total en COP enteros", () => {
    const result = calculateQuote({
      product: productFixture("llavero-metalico-redondo"),
      quantity: 50,
      techniqueId: "laser-llavero",
      additionalIds: [],
    });

    expect(result).toMatchObject({
      status: "complete",
      baseUnitPriceCop: 6_500,
      baseSubtotalCop: 325_000,
      techniqueCostCop: 55_000,
      additionalsCostCop: 0,
      subtotalCop: 380_000,
      taxAmountCop: 72_200,
      estimatedTotalCop: 452_200,
    });
  });

  it.each([
    [99, "llavero-50", 6_500],
    [100, "llavero-100", 5_200],
    [299, "llavero-100", 5_200],
    [300, "llavero-300", 4_500],
  ])("aplica el tramo correcto para %i unidades", (quantity, tierId, unitPrice) => {
    const result = calculateQuote({
      product: productFixture("llavero-metalico-redondo"),
      quantity,
      techniqueId: "laser-llavero",
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

  it("redondea el IVA una vez al COP más cercano", () => {
    const source = productFixture("llavero-metalico-redondo");
    const result = calculateQuote({
      product: {
        ...source,
        priceTiers: [{ id: "test-redondeo", minQuantity: 50, unitPrice: 6_501 }],
      },
      quantity: 50,
      techniqueId: "laser-llavero",
      additionalIds: [],
    });
    expect(result.subtotalCop).toBe(380_050);
    expect(result.taxAmountCop).toBe(72_210);
    expect(result.estimatedTotalCop).toBe(452_260);
  });

  it("devuelve requiresQuote sin total para un producto quote-only", () => {
    const source = productFixture("llavero-metalico-redondo");
    const result = calculateQuote({
      product: { ...source, pricingType: "quote-only", priceTiers: [] },
      quantity: 50,
      techniqueId: "laser-llavero",
      additionalIds: [],
    });
    expect(result.status).toBe("requiresQuote");
    expect(result.estimatedTotalCop).toBeNull();
    expect(result.excludedCharges[0]?.reason).toBe("productRequiresQuote");
  });

  it("rechaza fixed porque el modelo no tiene una regla comercial aprobada", () => {
    const source = productFixture("llavero-metalico-redondo");
    expect(() => calculateQuote({
      product: { ...source, pricingType: "fixed" },
      quantity: 50,
      techniqueId: "laser-llavero",
      additionalIds: [],
    })).toThrow(QuoteValidationError);
  });
});

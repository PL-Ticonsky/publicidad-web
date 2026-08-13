import { describe, expect, it } from "vitest";

import { calculateTaxCop, formatTaxRate, IVA_RATE_BASIS_POINTS } from "@/lib/quotation/money-policy";

describe("money policy", () => {
  it("mantiene una única tasa y redondea mitades positivas al COP siguiente", () => {
    expect(IVA_RATE_BASIS_POINTS).toBe(1_900);
    expect(formatTaxRate()).toBe("19 %");
    expect(calculateTaxCop(581_250)).toBe(110_438);
  });

  it("rechaza importes fraccionarios o inseguros", () => {
    expect(() => calculateTaxCop(1.5)).toThrow(/COP enteros/);
    expect(() => calculateTaxCop(Number.MAX_SAFE_INTEGER + 1)).toThrow(/COP enteros/);
  });
});

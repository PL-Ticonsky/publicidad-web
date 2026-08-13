import { describe, expect, it } from "vitest";

import { validateQuotation, MAX_QUOTE_QUANTITY } from "@/lib/quotation/validate-quotation";
import { productFixture } from "../../fixtures/quotation";

const product = productFixture("camiseta-corporativa-personalizada");

function errorsFor(quantity: number): string[] {
  return validateQuotation({ product, quantity, techniqueId: "dtf-textil", additionalIds: [] });
}

describe("validateQuotation", () => {
  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, 1e24])("rechaza la cantidad inválida %s", (quantity) => {
    expect(errorsFor(quantity).length).toBeGreaterThan(0);
  });

  it("rechaza una cantidad positiva inferior al mínimo", () => {
    expect(errorsFor(19)).toContain("La cantidad mínima es de 20 unidades.");
  });

  it("acepta mínimo, frontera de tramo y máximo temporal", () => {
    expect(errorsFor(20)).toEqual([]);
    expect(errorsFor(50)).toEqual([]);
    expect(errorsFor(MAX_QUOTE_QUANTITY)).toEqual([]);
  });

  it("rechaza una cantidad sobre el máximo comercial temporal", () => {
    expect(errorsFor(MAX_QUOTE_QUANTITY + 1)).toContain("La cantidad máxima temporal es de 100.000 unidades.");
  });

  it("rechaza selecciones ajenas o duplicadas", () => {
    expect(validateQuotation({ product, quantity: 20, techniqueId: "laser-usb", additionalIds: [] })).toContain("La técnica seleccionada no está disponible para este producto.");
    expect(validateQuotation({ product, quantity: 20, techniqueId: "dtf-textil", additionalIds: ["caja-usb"] })).toContain("Uno de los adicionales seleccionados no está disponible para este producto.");
    expect(validateQuotation({ product, quantity: 20, techniqueId: "dtf-textil", additionalIds: ["diseno-basico-camiseta", "diseno-basico-camiseta"] })).toContain("No se puede seleccionar el mismo adicional más de una vez.");
  });
});

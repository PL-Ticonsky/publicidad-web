import { describe, expect, it } from "vitest";

import { calculateQuote } from "@/lib/quotation/calculate-quote";
import { presentQuote } from "@/lib/quotation/present-quote";
import { buildWhatsAppMessage } from "@/lib/whatsapp/build-whatsapp-message";
import { buildWhatsAppUrl, isValidWhatsAppNumber } from "@/lib/whatsapp/build-whatsapp-url";
import { productFixture, validContact } from "../../fixtures/quotation";

describe("WhatsApp", () => {
  it.each([undefined, "", "1", "01234567", "abc30000000xyz"])("rechaza destino inválido %j", (number) => {
    expect(isValidWhatsAppNumber(number)).toBe(false);
    expect(buildWhatsAppUrl(number, "hola")).toBeNull();
  });

  it("acepta E.164 con formato legible y codifica exactamente tildes y saltos", () => {
    const message = "Bogotá y corazón\nSegunda línea";
    const url = buildWhatsAppUrl("+57 300 123 4567", message);
    expect(url).not.toBeNull();
    expect(new URL(url ?? "").pathname).toBe("/573001234567");
    expect(new URL(url ?? "").searchParams.get("text")).toBe(message);
  });

  it("usa exactamente la presentación del dominio y conserva semántica parcial", () => {
    const result = calculateQuote({
      product: productFixture("camiseta-corporativa-personalizada"),
      quantity: 50,
      techniqueId: "dtf-textil",
      additionalIds: ["diseno-basico-camiseta", "entrega-urgente-camiseta"],
    });
    const presentation = presentQuote(result);
    const message = buildWhatsAppMessage({ contact: validContact, result });

    expect(message).toContain("ESTIMACIÓN PARCIAL");
    for (const line of presentation.lines) expect(message).toContain(`${line.label}: ${line.value}`);
    expect(message).toContain(`${presentation.totalLabel}: ${presentation.totalValue}`);
    expect(message).toContain("Cargos excluidos por validar: Entrega urgente");
    expect(message).toContain("no una cotización formal");
  });
});

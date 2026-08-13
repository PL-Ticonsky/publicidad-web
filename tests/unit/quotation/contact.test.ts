import { describe, expect, it } from "vitest";

import { CONTACT_LIMITS, normalizeContact, validateContact, type QuoteContact } from "@/lib/quotation/contact";
import { validContact } from "../../fixtures/quotation";

describe("contact", () => {
  it("normaliza campos de una línea, teléfono, email y saltos", () => {
    expect(normalizeContact(validContact)).toEqual({
      name: "María José",
      company: "Propagplast",
      city: "Bogotá",
      phone: "+573001234567",
      email: "ventas@example.com",
      comments: "Primera línea\nSegunda línea",
      designNotes: "Logo con tilde: corazón",
    });
  });

  it.each(["", "   "])("rechaza nombre y ciudad vacíos: %j", (value) => {
    const errors = validateContact({ ...validContact, name: value, city: value });
    expect(errors.name).toBe("Ingresa tu nombre.");
    expect(errors.city).toBe("Ingresa tu ciudad.");
  });

  it.each(["abc3000000xyz", "123", "+01234567890123456"])("rechaza teléfono inválido %s", (phone) => {
    expect(validateContact({ ...validContact, phone }).phone).toBeDefined();
  });

  it("rechaza email inválido", () => {
    expect(validateContact({ ...validContact, email: "correo-invalido" }).email).toBe("Ingresa un correo válido.");
  });

  it("acepta exactamente los máximos y rechaza máximo más uno", () => {
    const fields = Object.keys(CONTACT_LIMITS) as Array<keyof QuoteContact>;
    for (const field of fields) {
      const exact = { ...validContact, [field]: "a".repeat(CONTACT_LIMITS[field]) };
      if (field === "phone") exact.phone = "1".repeat(15);
      if (field === "email") exact.email = `${"a".repeat(CONTACT_LIMITS.email - 12)}@example.com`;
      expect(validateContact(exact)[field]).toBeUndefined();

      const over = { ...validContact, [field]: "a".repeat(CONTACT_LIMITS[field] + 1) };
      expect(validateContact(over)[field]).toContain("máximo");
    }
  });
});

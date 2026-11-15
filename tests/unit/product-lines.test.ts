import { describe, expect, it } from "vitest";

import { categories } from "@/data/categories";
import { productLines } from "@/data/product-lines";
import { products } from "@/data/products";

describe("productLines", () => {
  it("mantiene exactamente las cinco líneas aprobadas en un orden estable", () => {
    expect(productLines.map((line) => line.slug)).toEqual([
      "canecas",
      "manillas",
      "llaveros",
      "mousepads",
      "portavasos",
    ]);
  });

  it("deriva categorías y enlaces desde la misma fuente", () => {
    expect(categories.map((category) => category.slug)).toEqual(productLines.map((line) => line.slug));
    for (const line of productLines) {
      expect(line.href).toBe(`/catalogo/${line.slug}`);
      expect(line.illustrationSrc).toBe(`/lines/${line.slug}.svg`);
      expect(line.alt.length).toBeGreaterThan(0);
    }
  });

  it("marca explícitamente las líneas sin datos comerciales aprobados", () => {
    expect(productLines.filter((line) => line.commercialDataStatus === "pending").map((line) => line.slug)).toEqual([
      "canecas",
      "manillas",
      "portavasos",
    ]);
  });

  it("no permite productos fuera de las cinco líneas", () => {
    const allowedIds = new Set(productLines.map((line) => line.id));
    expect(products.every((product) => allowedIds.has(product.categoryId as (typeof productLines)[number]["id"]))).toBe(true);
  });
});

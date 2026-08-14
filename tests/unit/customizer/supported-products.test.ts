import { describe, expect, it } from "vitest";
import {
  CUSTOMIZER_PRODUCT_SUPPORT,
  getApprovedCustomizerTemplate,
  isCustomizerProductSupported,
} from "@/data/customizer/supported-products";

describe("customizer product support", () => {
  it("uses only the three real keychains and real mouse pad slugs", () => {
    expect(
      CUSTOMIZER_PRODUCT_SUPPORT.map((product) => product.productSlug),
    ).toEqual([
      "llavero-metalico-redondo",
      "llavero-acrilico-personalizado",
      "llavero-destapador-corporativo",
      "mouse-pad-personalizado-rectangular",
    ]);
    expect(isCustomizerProductSupported("llavero-metalico-redondo")).toBe(true);
    expect(isCustomizerProductSupported("mouse-pad-falso")).toBe(false);
  });

  it("does not promote technical fixtures to commercial templates", () => {
    for (const product of CUSTOMIZER_PRODUCT_SUPPORT) {
      expect(getApprovedCustomizerTemplate(product.productSlug)).toBeUndefined();
    }
  });
});

import { getCustomizerProductSupport } from "@/data/customizer/supported-products";
import type { CustomizerTemplate } from "@/types/customizer";

const FIXTURE_LIMITATION =
  "Fixture técnico sin escala, color, material ni acabado comercial aprobados. No representa el producto final.";

/**
 * Isolated verification fixture. It is intentionally neutral and watermarked,
 * and must never be registered in APPROVED_CUSTOMIZER_TEMPLATES.
 */
export function getCustomizerDemoFixture(
  productSlug: string,
): CustomizerTemplate | undefined {
  const product = getCustomizerProductSupport(productSlug);
  if (!product) return undefined;

  return {
    id: `fixture-${productSlug}`,
    productSlug,
    productName: product.productName,
    canvas: { width: 800, height: 600 },
    printArea: {
      x: 100,
      y: 75,
      width: 600,
      height: 450,
      shape: "rectangle",
      borderRadius: 24,
    },
    limitation: FIXTURE_LIMITATION,
    visualStatus: "fixture",
    fixtureStyle: {
      background: "#e9e8e4",
      printSurface: "#faf9f5",
      border: "#1b1c1a",
      watermark: "FIXTURE TÉCNICO",
    },
  };
}

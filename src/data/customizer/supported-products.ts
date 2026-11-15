import type {
  CustomizerProductSupport,
  CustomizerTemplate,
} from "@/types/customizer";

/**
 * Explicit allow-list discovered from src/data/products.ts.
 *
 * The commercial templates deliberately remain absent: PRODUCT_SCOPE.md says
 * that the exact approved print areas and mockups are pending. A real template
 * must not be inferred from the monolithic catalogue illustrations.
 */
export const CUSTOMIZER_PRODUCT_SUPPORT = [
  {
    productSlug: "llavero-metalico-redondo",
    productName: "Llavero metálico redondo",
    templateStatus: "awaiting-approved-assets",
  },
  {
    productSlug: "llavero-acrilico-personalizado",
    productName: "Llavero acrílico personalizado",
    templateStatus: "awaiting-approved-assets",
  },
  {
    productSlug: "llavero-destapador-corporativo",
    productName: "Llavero destapador corporativo",
    templateStatus: "awaiting-approved-assets",
  },
  {
    productSlug: "mouse-pad-personalizado-rectangular",
    productName: "Mousepad personalizado rectangular",
    templateStatus: "awaiting-approved-assets",
  },
] as const satisfies readonly CustomizerProductSupport[];

const productSupportBySlug = new Map<string, CustomizerProductSupport>(
  CUSTOMIZER_PRODUCT_SUPPORT.map((product) => [product.productSlug, product]),
);

// Populate only with templates backed by business-approved base/overlay assets
// and print-area measurements. There are no approved templates in this branch.
export const APPROVED_CUSTOMIZER_TEMPLATES: Readonly<
  Record<string, CustomizerTemplate>
> = Object.freeze({});

export function getCustomizerProductSupport(productSlug: string) {
  return productSupportBySlug.get(productSlug);
}

export function getApprovedCustomizerTemplate(productSlug: string) {
  return APPROVED_CUSTOMIZER_TEMPLATES[productSlug];
}

export function isCustomizerProductSupported(productSlug: string) {
  return productSupportBySlug.has(productSlug);
}

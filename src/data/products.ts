import type { Product } from "@/types/product";

export const products: readonly Product[] = [
  {
    id: "llavero-metalico",
    sku: "LL-MET-RED-001",
    slug: "llavero-metalico-redondo",
    name: "Llavero metálico redondo",
    shortDescription: "Llavero metálico con grabado láser para regalos corporativos.",
    description: "Llavero metálico personalizado con grabado láser para marcas, eventos y regalos corporativos.",
    categoryId: "llaveros",
    images: [{ id: "llavero-principal", src: "/products/llavero.svg", alt: "Ilustración de llavero metálico redondo", isPrimary: true }],
    minimumQuantity: 50,
    pricingType: "tiered",
    priceTiers: [
      { id: "llavero-50", minQuantity: 50, maxQuantity: 99, unitPrice: 6500 },
      { id: "llavero-100", minQuantity: 100, maxQuantity: 299, unitPrice: 5200 },
      { id: "llavero-300", minQuantity: 300, unitPrice: 4500 },
    ],
    availableTechniqueIds: ["laser-llavero"],
    availableAdditionalIds: ["empaque-llavero"],
    active: true,
  },
  {
    id: "mouse-pad-rectangular",
    sku: "MP-SUB-RECT-001",
    slug: "mouse-pad-personalizado-rectangular",
    name: "Mousepad personalizado rectangular",
    shortDescription: "Mousepad publicitario para espacios de trabajo, eventos y regalos.",
    description: "Mousepad publicitario ideal para espacios de trabajo, eventos y regalos corporativos.",
    categoryId: "mousepads",
    images: [{ id: "mouse-pad-principal", src: "/products/mouse-pad.svg", alt: "Ilustración de mousepad rectangular", isPrimary: true }],
    minimumQuantity: 50,
    pricingType: "tiered",
    priceTiers: [
      { id: "mouse-pad-50", minQuantity: 50, maxQuantity: 99, unitPrice: 9500 },
      { id: "mouse-pad-100", minQuantity: 100, maxQuantity: 299, unitPrice: 8500 },
      { id: "mouse-pad-300", minQuantity: 300, unitPrice: 7600 },
    ],
    availableTechniqueIds: ["sublimacion-mouse-pad"],
    availableAdditionalIds: ["diseno-basico-mouse-pad", "empaque-mouse-pad"],
    active: true,
  },
  {
    id: "llavero-acrilico-personalizado",
    sku: "LL-ACR-001",
    slug: "llavero-acrilico-personalizado",
    name: "Llavero acrílico personalizado",
    shortDescription: "Llavero liviano personalizado para campañas, eventos y recordación de marca.",
    description: "Llavero de material acrílico para campañas promocionales y eventos, personalizable con marcación del logotipo o mensaje corporativo.",
    categoryId: "llaveros",
    images: [{ id: "llavero-acrilico-principal", src: "/products/llavero-acrilico-personalizado.svg", alt: "Ilustración de llavero acrílico personalizado", isPrimary: true }],
    minimumQuantity: 50,
    pricingType: "tiered",
    priceTiers: [
      { id: "llavero-acrilico-50", minQuantity: 50, maxQuantity: 99, unitPrice: 5200 },
      { id: "llavero-acrilico-100", minQuantity: 100, maxQuantity: 299, unitPrice: 4300 },
      { id: "llavero-acrilico-300", minQuantity: 300, unitPrice: 3600 },
    ],
    availableTechniqueIds: ["impresion-uv"],
    availableAdditionalIds: ["empaque-llavero"],
    active: true,
  },
  {
    id: "llavero-destapador-corporativo",
    sku: "LL-DES-001",
    slug: "llavero-destapador-corporativo",
    name: "Llavero destapador corporativo",
    shortDescription: "Accesorio metálico funcional con marcación para eventos y regalos empresariales.",
    description: "Llavero destapador de material metálico para eventos y obsequios corporativos, personalizable con la identidad visual de la empresa.",
    categoryId: "llaveros",
    images: [{ id: "llavero-destapador-principal", src: "/products/llavero-destapador-corporativo.svg", alt: "Ilustración de llavero destapador corporativo", isPrimary: true }],
    minimumQuantity: 50,
    pricingType: "tiered",
    priceTiers: [
      { id: "llavero-destapador-50", minQuantity: 50, maxQuantity: 99, unitPrice: 7800 },
      { id: "llavero-destapador-100", minQuantity: 100, maxQuantity: 299, unitPrice: 6600 },
      { id: "llavero-destapador-300", minQuantity: 300, unitPrice: 5800 },
    ],
    availableTechniqueIds: ["laser-llavero"],
    availableAdditionalIds: ["empaque-llavero"],
    active: true,
  },
];

export function getAllActiveProducts(): Product[] {
  return products.filter((product) => product.active);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.active && product.slug === slug);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return getAllActiveProducts().filter((product) => product.categoryId === categoryId);
}

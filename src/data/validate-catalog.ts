import { existsSync } from "node:fs";
import { join } from "node:path";

import { additionals } from "@/data/additionals";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { techniques } from "@/data/techniques";
import { calculateQuote } from "@/lib/quotation/calculate-quote";
import { buildWhatsAppMessage } from "@/lib/whatsapp/build-whatsapp-message";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-whatsapp-url";

function duplicateValues(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  values.forEach((value) => {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  });

  return [...duplicates];
}

export function assertCatalogIntegrity(): void {
  const errors: string[] = [];
  const categoryIds = new Set(categories.map((category) => category.id));
  const techniqueIds = new Set(techniques.map((technique) => technique.id));
  const additionalIds = new Set(additionals.map((additional) => additional.id));

  const duplicateCategoryIds = duplicateValues(categories.map((category) => category.id));
  const duplicateCategorySlugs = duplicateValues(categories.map((category) => category.slug));
  const duplicateProductIds = duplicateValues(products.map((product) => product.id));
  const duplicateProductSlugs = duplicateValues(products.map((product) => product.slug));
  const duplicateTechniqueIds = duplicateValues(techniques.map((technique) => technique.id));
  const duplicateAdditionalIds = duplicateValues(additionals.map((additional) => additional.id));

  if (duplicateCategoryIds.length) errors.push(`IDs de categoría duplicados: ${duplicateCategoryIds.join(", ")}`);
  if (duplicateCategorySlugs.length) errors.push(`Slugs de categoría duplicados: ${duplicateCategorySlugs.join(", ")}`);
  if (duplicateProductIds.length) errors.push(`IDs de producto duplicados: ${duplicateProductIds.join(", ")}`);
  if (duplicateProductSlugs.length) errors.push(`Slugs de producto duplicados: ${duplicateProductSlugs.join(", ")}`);
  if (duplicateTechniqueIds.length) errors.push(`IDs de técnica duplicados: ${duplicateTechniqueIds.join(", ")}`);
  if (duplicateAdditionalIds.length) errors.push(`IDs de adicional duplicados: ${duplicateAdditionalIds.join(", ")}`);

  products.forEach((product) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug)) {
      errors.push(`${product.slug}: el slug no tiene un formato válido.`);
    }
    if (!categoryIds.has(product.categoryId)) {
      errors.push(`${product.slug}: categoryId inexistente (${product.categoryId}).`);
    }
    if (!Number.isInteger(product.minimumQuantity) || product.minimumQuantity <= 0) {
      errors.push(`${product.slug}: minimumQuantity debe ser un entero positivo.`);
    }
    if (product.images.length === 0) {
      errors.push(`${product.slug}: debe tener al menos una imagen.`);
    }
    if (product.availableTechniqueIds.length === 0) {
      errors.push(`${product.slug}: debe tener al menos una técnica disponible.`);
    }

    const duplicateImageIds = duplicateValues(product.images.map((image) => image.id));
    if (duplicateImageIds.length) {
      errors.push(`${product.slug}: IDs de imagen duplicados (${duplicateImageIds.join(", ")}).`);
    }

    product.images.forEach((image) => {
      const relativePath = image.src.replace(/^\/+/, "");
      if (!image.src.startsWith("/") || !existsSync(join(process.cwd(), "public", relativePath))) {
        errors.push(`${product.slug}: imagen local inexistente (${image.src}).`);
      }
    });

    product.availableTechniqueIds.forEach((id) => {
      if (!techniqueIds.has(id)) errors.push(`${product.slug}: técnica inexistente (${id}).`);
    });
    product.availableAdditionalIds.forEach((id) => {
      if (!additionalIds.has(id)) errors.push(`${product.slug}: adicional inexistente (${id}).`);
    });

    if (product.pricingType === "tiered") {
      if (product.priceTiers.length === 0) {
        errors.push(`${product.slug}: un producto tiered debe tener rangos de precio.`);
        return;
      }

      const duplicateTierIds = duplicateValues(product.priceTiers.map((tier) => tier.id));
      if (duplicateTierIds.length) {
        errors.push(`${product.slug}: IDs de rango duplicados (${duplicateTierIds.join(", ")}).`);
      }

      product.priceTiers.forEach((tier, index) => {
        if (!Number.isInteger(tier.minQuantity) || tier.minQuantity <= 0) {
          errors.push(`${product.slug}/${tier.id}: minQuantity debe ser un entero positivo.`);
        }
        if (tier.maxQuantity !== undefined && (!Number.isInteger(tier.maxQuantity) || tier.maxQuantity < tier.minQuantity)) {
          errors.push(`${product.slug}/${tier.id}: maxQuantity no es válido.`);
        }
        if (!Number.isInteger(tier.unitPrice) || tier.unitPrice <= 0) {
          errors.push(`${product.slug}/${tier.id}: unitPrice debe ser un entero positivo.`);
        }
        if (index === 0 && tier.minQuantity !== product.minimumQuantity) {
          errors.push(`${product.slug}: el primer rango debe comenzar en minimumQuantity.`);
        }

        const previousTier = product.priceTiers[index - 1];
        if (previousTier) {
          if (previousTier.maxQuantity === undefined || tier.minQuantity !== previousTier.maxQuantity + 1) {
            errors.push(`${product.slug}: los rangos ${previousTier.id} y ${tier.id} no son continuos.`);
          }
          if (tier.unitPrice > previousTier.unitPrice) {
            errors.push(`${product.slug}: el precio aumenta en el rango ${tier.id}.`);
          }
        }

        const isLast = index === product.priceTiers.length - 1;
        if (isLast && tier.maxQuantity !== undefined) {
          errors.push(`${product.slug}: el último rango debe quedar abierto.`);
        }
      });
    }
  });

  if (errors.length === 0) {
    products.forEach((product) => {
      if (product.pricingType !== "tiered") return;

      product.priceTiers.forEach((tier) => {
        try {
          const techniqueId = product.availableTechniqueIds[0];
          const additionalIds = product.availableAdditionalIds.slice(0, 1);
          const result = calculateQuote({
            product,
            quantity: tier.minQuantity,
            techniqueId,
            additionalIds,
          });

          if (result.status !== "estimated" || result.selectedTier?.id !== tier.id || result.estimatedTotal === null || result.estimatedTotal <= 0) {
            errors.push(`${product.slug}/${tier.id}: el motor no devolvió la estimación esperada.`);
            return;
          }

          const techniqueName = techniques.find((technique) => technique.id === techniqueId)?.name;
          const additionalNames = additionals
            .filter((additional) => additionalIds.includes(additional.id))
            .map((additional) => additional.name);
          const message = buildWhatsAppMessage({
            product,
            quantity: tier.minQuantity,
            techniqueName,
            additionalNames,
            contact: {
              name: "Cliente de prueba",
              company: "Empresa de prueba",
              city: "Bogotá",
              phone: "",
              email: "",
              comments: "",
              designNotes: "",
            },
            result,
          });
          const whatsappUrl = buildWhatsAppUrl("57 300-123-4567", message);

          if (!message.includes(product.name) || message.includes("undefined") || !whatsappUrl?.startsWith("https://wa.me/573001234567?text=")) {
            errors.push(`${product.slug}/${tier.id}: el mensaje o enlace de WhatsApp no es válido.`);
          }
        } catch (error) {
          const detail = error instanceof Error ? error.message : "Error desconocido";
          errors.push(`${product.slug}/${tier.id}: falló el cálculo de prueba (${detail}).`);
        }
      });
    });
  }

  if (errors.length > 0) {
    throw new Error(`Catálogo local inválido:\n- ${errors.join("\n- ")}`);
  }
}

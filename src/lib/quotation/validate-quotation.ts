import { getAdditionalById } from "@/data/additionals";
import { getTechniqueById } from "@/data/techniques";
import type { QuoteInput } from "@/types/quotation";

export function validateQuotation(input: QuoteInput): string[] {
  const errors: string[] = [];

  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    errors.push("La cantidad debe ser un número entero positivo.");
  } else if (input.quantity < input.product.minimumQuantity) {
    errors.push(`La cantidad mínima es de ${input.product.minimumQuantity.toLocaleString("es-CO")} unidades.`);
  }

  if (input.product.availableTechniqueIds.length > 0) {
    if (!input.techniqueId) {
      errors.push("Selecciona una técnica de personalización.");
    } else if (!input.product.availableTechniqueIds.includes(input.techniqueId) || !getTechniqueById(input.techniqueId)) {
      errors.push("La técnica seleccionada no está disponible para este producto.");
    }
  }

  const invalidAdditional = input.additionalIds.find(
    (id) => !input.product.availableAdditionalIds.includes(id) || !getAdditionalById(id),
  );
  if (invalidAdditional) errors.push("Uno de los adicionales seleccionados no está disponible para este producto.");

  return errors;
}

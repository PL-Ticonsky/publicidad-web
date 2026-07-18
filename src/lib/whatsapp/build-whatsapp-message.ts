import { formatCOP } from "@/lib/format";
import type { WhatsAppQuote } from "@/types/quotation";

function valueOrFallback(value: string, fallback = "No indicado"): string {
  return value.trim() || fallback;
}

export function buildWhatsAppMessage(quote: WhatsAppQuote): string {
  const { contact, product, result } = quote;
  const priceLines =
    result.status === "quote-only" || result.estimatedTotal === null || result.finalUnitPrice === null
      ? ["Precio: pendiente de validación por un asesor."]
      : [
          `Precio estimado por unidad: ${formatCOP(result.finalUnitPrice)}`,
          `Subtotal estimado: ${formatCOP(result.subtotal ?? 0)}`,
          `IVA estimado (19%): ${formatCOP(result.taxAmount ?? 0)}`,
          `Total estimado: ${formatCOP(result.estimatedTotal)}`,
        ];

  return [
    "Hola, deseo solicitar una cotización.",
    "",
    "DATOS DEL CLIENTE",
    `Nombre: ${valueOrFallback(contact.name)}`,
    `Empresa: ${valueOrFallback(contact.company)}`,
    `Ciudad: ${valueOrFallback(contact.city)}`,
    `Teléfono: ${valueOrFallback(contact.phone)}`,
    `Email: ${valueOrFallback(contact.email)}`,
    "",
    "PRODUCTO",
    `Producto: ${product.name}`,
    `Cantidad: ${quote.quantity.toLocaleString("es-CO")}`,
    `Técnica: ${quote.techniqueName ?? "No aplica"}`,
    `Adicionales: ${quote.additionalNames.length > 0 ? quote.additionalNames.join(", ") : "Ninguno"}`,
    "",
    "ESTIMACIÓN",
    ...priceLines,
    "",
    "COMENTARIOS",
    valueOrFallback(contact.comments, "Sin comentarios"),
    `Observaciones del diseño: ${valueOrFallback(contact.designNotes, "Sin observaciones")}`,
    "",
    "El valor final puede variar según el diseño, técnica de personalización, materiales, disponibilidad, urgencia y condiciones de entrega.",
  ].join("\n");
}

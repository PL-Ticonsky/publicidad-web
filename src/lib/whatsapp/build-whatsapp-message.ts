import { normalizeContact, type QuoteContact } from "@/lib/quotation/contact";
import { presentQuote } from "@/lib/quotation/present-quote";
import type { QuoteResult } from "@/lib/quotation/types";

function valueOrFallback(value: string, fallback = "No indicado"): string {
  return value.trim() || fallback;
}

export interface WhatsAppQuote {
  contact: QuoteContact;
  result: QuoteResult;
}

export function buildWhatsAppMessage(quote: WhatsAppQuote): string {
  const contact = normalizeContact(quote.contact);
  const { result } = quote;
  const presentation = presentQuote(result);
  const priceLines = presentation.lines.map((line) => `${line.label}: ${line.value}`);
  if (presentation.totalLabel && presentation.totalValue) {
    priceLines.push(`${presentation.totalLabel}: ${presentation.totalValue}`);
  }
  if (presentation.excludedCharges.length > 0) {
    priceLines.push(`Cargos excluidos por validar: ${presentation.excludedCharges.join(", ")}`);
  }
  if (result.status === "requiresQuote") {
    priceLines.push("No se muestra un total hasta validar los importes pendientes.");
  }

  return [
    "Hola, deseo enviar una solicitud estimada.",
    "",
    "DATOS DEL CLIENTE",
    `Nombre: ${valueOrFallback(contact.name)}`,
    `Empresa: ${valueOrFallback(contact.company)}`,
    `Ciudad: ${valueOrFallback(contact.city)}`,
    `Teléfono: ${valueOrFallback(contact.phone)}`,
    `Email: ${valueOrFallback(contact.email)}`,
    "",
    "PRODUCTO",
    `Producto: ${result.product.name}`,
    `Cantidad: ${result.quantity.toLocaleString("es-CO")}`,
    `Técnica: ${result.technique?.name ?? "No aplica"}`,
    `Adicionales: ${result.additionals.length > 0 ? result.additionals.map((additional) => additional.name).join(", ") : "Ninguno"}`,
    "",
    presentation.heading.toUpperCase(),
    ...priceLines,
    "",
    "COMENTARIOS",
    valueOrFallback(contact.comments, "Sin comentarios"),
    `Observaciones del diseño: ${valueOrFallback(contact.designNotes, "Sin observaciones")}`,
    "",
    "Esta es una solicitud estimada, no una cotización formal. Los valores pueden variar tras la validación comercial.",
  ].join("\n");
}

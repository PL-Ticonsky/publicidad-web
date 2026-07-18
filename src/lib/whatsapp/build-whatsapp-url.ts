export function normalizeWhatsAppNumber(value: string | undefined): string {
  return value?.replace(/\D/g, "") ?? "";
}

export function buildWhatsAppUrl(number: string | undefined, message = ""): string | null {
  const normalizedNumber = normalizeWhatsAppNumber(number);
  if (!normalizedNumber) return null;
  return `https://wa.me/${normalizedNumber}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

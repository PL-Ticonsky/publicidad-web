export function normalizeWhatsAppNumber(value: string | undefined): string {
  return value?.replace(/\D/g, "") ?? "";
}

export function isValidWhatsAppNumber(value: string | undefined): boolean {
  const rawValue = value?.trim() ?? "";
  return /^\+?[0-9\s().-]+$/.test(rawValue) && /^[1-9]\d{7,14}$/.test(normalizeWhatsAppNumber(rawValue));
}

export function assertValidWhatsAppNumber(value: string | undefined): void {
  if (!isValidWhatsAppNumber(value)) {
    throw new Error("NEXT_PUBLIC_WHATSAPP_NUMBER debe estar en formato internacional E.164 (8 a 15 dígitos, sin cero inicial).");
  }
}

export function buildWhatsAppUrl(number: string | undefined, message = ""): string | null {
  const normalizedNumber = normalizeWhatsAppNumber(number);
  if (!isValidWhatsAppNumber(number)) return null;
  return `https://wa.me/${normalizedNumber}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

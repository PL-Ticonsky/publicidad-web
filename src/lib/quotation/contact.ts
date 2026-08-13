export const CONTACT_LIMITS = {
  name: 80,
  company: 100,
  city: 80,
  phone: 20,
  email: 254,
  comments: 500,
  designNotes: 500,
} as const;

export interface QuoteContact {
  name: string;
  company: string;
  city: string;
  phone: string;
  email: string;
  comments: string;
  designNotes: string;
}

export type ContactField = keyof QuoteContact;
export type ContactErrors = Partial<Record<ContactField, string>>;

function normalizeSingleLine(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeMultiline(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim().replace(/[\t ]+/g, " "))
    .join("\n")
    .trim();
}

function normalizePhone(value: string): string {
  const normalized = normalizeSingleLine(value);
  if (!normalized) return "";
  const digits = normalized.replace(/\D/g, "");
  return normalized.startsWith("+") ? `+${digits}` : digits;
}

export function normalizeContact(contact: QuoteContact): QuoteContact {
  return {
    name: normalizeSingleLine(contact.name),
    company: normalizeSingleLine(contact.company),
    city: normalizeSingleLine(contact.city),
    phone: normalizePhone(contact.phone),
    email: normalizeSingleLine(contact.email).toLowerCase(),
    comments: normalizeMultiline(contact.comments),
    designNotes: normalizeMultiline(contact.designNotes),
  };
}

export function validateContact(contact: QuoteContact): ContactErrors {
  const normalized = normalizeContact(contact);
  const errors: ContactErrors = {};

  if (!normalized.name) errors.name = "Ingresa tu nombre.";
  if (!normalized.city) errors.city = "Ingresa tu ciudad.";

  for (const field of Object.keys(CONTACT_LIMITS) as ContactField[]) {
    const length = field === "phone" ? normalizeSingleLine(contact.phone).length : normalized[field].length;
    if (length > CONTACT_LIMITS[field]) {
      errors[field] = `Usa máximo ${CONTACT_LIMITS[field].toLocaleString("es-CO")} caracteres.`;
    }
  }

  const rawPhone = normalizeSingleLine(contact.phone);
  if (rawPhone && !errors.phone) {
    const structurallyValid = /^\+?[0-9\s().-]+$/.test(rawPhone);
    const digits = rawPhone.replace(/\D/g, "");
    if (!structurallyValid || digits.length < 7 || digits.length > 15) {
      errors.phone = "Ingresa un teléfono válido de 7 a 15 dígitos.";
    }
  }

  if (normalized.email && !errors.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) {
    errors.email = "Ingresa un correo válido.";
  }

  return errors;
}

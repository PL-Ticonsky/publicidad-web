export type CommerceEvent = "view_product" | "select_quantity" | "select_customization" | "begin_quote" | "quote_completed" | "whatsapp_click" | "quote_error";

export function trackCommerceEvent(event: CommerceEvent, detail: Record<string, string | number | boolean | null> = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("tinta:commerce", { detail: { event, ...detail } }));
  const target = window as Window & { dataLayer?: Record<string, unknown>[] };
  target.dataLayer?.push({ event, ...detail });
}

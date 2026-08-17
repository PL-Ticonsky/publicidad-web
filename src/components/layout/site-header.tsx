import { buildWhatsAppUrl } from "@/lib/whatsapp/build-whatsapp-url";
import { SiteHeaderClient } from "./site-header-client";

export function SiteHeader() {
  const whatsappUrl = buildWhatsAppUrl(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
  return <SiteHeaderClient whatsappUrl={whatsappUrl} />;
}

import type { Metadata } from "next";
import { Anton, Source_Serif_4 } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CustomizerPreviewProvider } from "@/components/personalization/customizer-preview-provider";
import "./globals.css";

const anton = Anton({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Propagplast | Publicidad física personalizada", template: "%s | Propagplast" },
  description:
    "Cotiza productos promocionales personalizados por cantidad para empresas, eventos y campañas en Colombia.",
  openGraph: { title: "Propagplast | Publicidad física personalizada", description: "Productos promocionales para empresas, eventos y campañas en Colombia.", type: "website", locale: "es_CO" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className={`${anton.variable} ${sourceSerif.variable} min-h-full flex flex-col`}><SiteHeader /><CustomizerPreviewProvider>{children}</CustomizerPreviewProvider><SiteFooter /></body>
    </html>
  );
}

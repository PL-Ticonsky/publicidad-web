import type { Metadata } from "next";
import { Bodoni_Moda, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CustomizerPreviewProvider } from "@/components/personalization/customizer-preview-provider";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const hanken = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-technical",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Tinta | Productos promocionales personalizados", template: "%s | Tinta" },
  description:
    "Cotiza productos promocionales personalizados por cantidad para empresas, eventos y campañas en Colombia.",
  openGraph: { title: "Tinta | Publicidad física personalizada", description: "Productos promocionales para empresas, eventos y campañas en Colombia.", type: "website", locale: "es_CO" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className={`${bodoni.variable} ${hanken.variable} ${mono.variable} min-h-full flex flex-col`}><SiteHeader /><CustomizerPreviewProvider>{children}</CustomizerPreviewProvider><SiteFooter /></body>
    </html>
  );
}

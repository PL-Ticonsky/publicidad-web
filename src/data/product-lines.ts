export interface ProductLine {
  id: "canecas" | "manillas" | "llaveros" | "mousepads" | "portavasos";
  slug: "canecas" | "manillas" | "llaveros" | "mousepads" | "portavasos";
  name: string;
  shortDescription: string;
  illustrationSrc: string;
  href: string;
  alt: string;
  commercialDataStatus: "available" | "pending";
}

export const productLines = [
  {
    id: "canecas",
    slug: "canecas",
    name: "Canecas",
    shortDescription: "Recipientes promocionales personalizables para acompañar acciones de marca.",
    illustrationSrc: "/lines/canecas.svg",
    href: "/catalogo/canecas",
    alt: "Ilustración geométrica de una caneca publicitaria",
    commercialDataStatus: "pending",
  },
  {
    id: "manillas",
    slug: "manillas",
    name: "Manillas",
    shortDescription: "Accesorios promocionales para identificar campañas, eventos y comunidades.",
    illustrationSrc: "/lines/manillas.svg",
    href: "/catalogo/manillas",
    alt: "Ilustración geométrica de una manilla promocional",
    commercialDataStatus: "pending",
  },
  {
    id: "llaveros",
    slug: "llaveros",
    name: "Llaveros",
    shortDescription: "Objetos promocionales compactos para mantener la marca presente.",
    illustrationSrc: "/lines/llaveros.svg",
    href: "/catalogo/llaveros",
    alt: "Ilustración geométrica de un llavero corporativo",
    commercialDataStatus: "available",
  },
  {
    id: "mousepads",
    slug: "mousepads",
    name: "Mousepads",
    shortDescription: "Superficies promocionales para espacios de trabajo y campañas.",
    illustrationSrc: "/lines/mousepads.svg",
    href: "/catalogo/mousepads",
    alt: "Ilustración geométrica de un mousepad personalizable",
    commercialDataStatus: "available",
  },
  {
    id: "portavasos",
    slug: "portavasos",
    name: "Portavasos",
    shortDescription: "Piezas promocionales para integrar la marca en mesas y espacios compartidos.",
    illustrationSrc: "/lines/portavasos.svg",
    href: "/catalogo/portavasos",
    alt: "Ilustración geométrica de un portavasos promocional",
    commercialDataStatus: "pending",
  },
] as const satisfies readonly ProductLine[];

export function getAllProductLines(): ProductLine[] {
  return [...productLines];
}

export function getProductLineById(id: string): ProductLine | undefined {
  return productLines.find((line) => line.id === id);
}

export function getProductLineBySlug(slug: string): ProductLine | undefined {
  return productLines.find((line) => line.slug === slug);
}

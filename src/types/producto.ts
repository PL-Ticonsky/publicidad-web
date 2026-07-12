export interface CatalogoProducto {
  id: string;
  nombre: string;
  slug: string;
  categoria: string;
  categoria_slug?: string | null;
  imagen_principal: string | null;
  cantidad_minima: number;
  precio_desde: number | null;
}

export interface Producto {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  cantidad_minima: number;
  activo?: boolean;
}

export interface CategoriaProducto {
  id: string;
  nombre: string;
  slug: string;
}

export interface ImagenProducto {
  id: string;
  url: string;
  alt: string | null;
  es_principal: boolean;
  orden?: number;
}

export interface TierPrecio {
  id: string;
  cantidad_desde: number;
  cantidad_hasta: number | null;
  precio_unitario: number;
}

export interface CustomizacionProducto {
  id: string;
  nombre: string;
  descripcion?: string | null;
  precio_adicional?: number | null;
}

export interface AdicionalProducto {
  id: string;
  nombre: string;
  descripcion?: string | null;
  precio: number;
}

export interface ProductoDetalle {
  producto: Producto;
  categoria: CategoriaProducto;
  imagenes: ImagenProducto[];
  tiers_precio: TierPrecio[];
  customizaciones: CustomizacionProducto[];
  adicionales: AdicionalProducto[];
}

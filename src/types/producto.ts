export interface CatalogoProducto {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  sku: string | null;
  cantidad_minima: number;
  destacado: boolean;
  categoria: string;
  categoria_slug?: string | null;
  imagen_principal: string | null;
  precio_desde: number | null;
}

export interface Producto {
  id: string;
  nombre: string;
  slug: string;
  sku: string | null;
  descripcion: string | null;
  cantidad_minima: number;
  destacado: boolean;
  activo?: boolean;
}

export interface CategoriaProducto {
  id: string;
  nombre: string;
  slug: string;
}

export interface ImagenProducto {
  id: string;
  url_imagen: string;
  texto_alt: string | null;
  es_principal: boolean;
  orden: number;
}

export interface TierPrecio {
  id: string;
  cantidad_minima: number;
  cantidad_maxima: number | null;
  precio_unitario: number;
}

export interface CustomizacionProducto {
  customizacion_id: string;
  customizacion_posible_id: string;
  nombre: string;
  descripcion: string | null;
  costo_fijo: number;
  costo_unitario_extra: number;
  colores_maximos: number | null;
  es_default: boolean;
}

export type TipoCobroAdicional = "fijo" | "por_unidad" | "porcentaje";

export interface AdicionalProducto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  tipo_cobro: TipoCobroAdicional;
}

export interface ProductoDetalle extends Producto {
  categoria: CategoriaProducto;
  imagenes: ImagenProducto[];
  tiers_precio: TierPrecio[];
  customizaciones: CustomizacionProducto[];
  adicionales: AdicionalProducto[];
}

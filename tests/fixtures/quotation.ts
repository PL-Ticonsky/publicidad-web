import { getProductBySlug } from "@/data/products";
import type { Product } from "@/types/product";

export function productFixture(slug: string): Product {
  const product = getProductBySlug(slug);
  if (!product) throw new Error(`Fixture de producto inexistente: ${slug}`);
  return product;
}

export const validContact = {
  name: "  María   José  ",
  company: " Propagplast ",
  city: "  Bogotá  ",
  phone: "+57 (300) 123-4567",
  email: " VENTAS@EXAMPLE.COM ",
  comments: "Primera línea\r\n  Segunda   línea",
  designNotes: "Logo con tilde: corazón",
};

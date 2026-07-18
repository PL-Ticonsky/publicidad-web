"use client";

import { useEffect } from "react";
import { trackCommerceEvent } from "@/lib/analytics";

export function ProductViewEvent({ id, slug }: { id: string; slug: string }) {
  useEffect(() => { trackCommerceEvent("view_product", { product_id: id, slug }); }, [id, slug]);
  return null;
}

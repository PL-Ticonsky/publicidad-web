"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageIcon } from "@/components/ui/icons";

export function ProductImage({ src, alt, sizes, priority = false, className = "object-contain" }: { src: string | null; alt: string; sizes: string; priority?: boolean; className?: string }) {
  const [failed, setFailed] = useState(false);
  const supported = Boolean(src?.startsWith("/"));
  if (!src || !supported || failed) return <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 overflow-hidden bg-[var(--stone)] px-6 text-center text-[var(--muted)] before:absolute before:inset-0 before:opacity-[.07] before:[background-image:radial-gradient(var(--ink)_1px,transparent_1px)] before:[background-size:8px_8px]" role="img" aria-label={`Fotografía no disponible: ${alt}`}><ImageIcon className="relative h-8 w-8" /><span className="font-technical relative text-[9px] uppercase tracking-[.08em]">Fotografía pendiente</span></div>;
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} onError={() => setFailed(true)} />;
}

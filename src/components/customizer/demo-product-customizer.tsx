"use client";

import { getCustomizerDemoFixture } from "@/data/customizer/demo-fixtures";
import type { ProductCustomizerProps } from "@/types/customizer";
import { CustomizerWorkspace } from "./customizer-workspace";

export function DemoProductCustomizer({
  productSlug,
  onPreviewChange,
}: ProductCustomizerProps) {
  const fixture = getCustomizerDemoFixture(productSlug);
  if (!fixture) return null;
  return <CustomizerWorkspace key={fixture.id} template={fixture} onPreviewChange={onPreviewChange} />;
}

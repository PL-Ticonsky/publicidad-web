import type { CustomizerTemplate } from "@/types/customizer";

export type LoadedCustomizerLayers = {
  base: HTMLImageElement | null;
  overlay: HTMLImageElement | null;
  dispose: () => void;
};

async function loadImage(source: string) {
  const image = new Image();
  image.src = source;
  await image.decode();
  return image;
}

export async function loadCustomizerTemplateLayers(
  template: CustomizerTemplate,
): Promise<LoadedCustomizerLayers> {
  try {
    const [base, overlay] = await Promise.all([
      template.baseImageSrc ? loadImage(template.baseImageSrc) : null,
      template.overlayImageSrc ? loadImage(template.overlayImageSrc) : null,
    ]);

    return {
      base,
      overlay,
      dispose: () => {
        if (base) base.src = "";
        if (overlay) overlay.src = "";
      },
    };
  } catch {
    throw new Error(
      "No fue posible preparar las capas visuales del producto. Inténtalo de nuevo.",
    );
  }
}

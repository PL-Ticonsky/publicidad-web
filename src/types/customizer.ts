export const CUSTOMIZER_ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export type CustomizerAllowedMimeType =
  (typeof CUSTOMIZER_ALLOWED_MIME_TYPES)[number];

export type CustomizerPreview = {
  productSlug: string;
  sourceFileName: string;
  previewBlob: Blob;
  previewObjectUrl: string;
  width: number;
  height: number;
};

export type ProductCustomizerProps = {
  productSlug: string;
  onPreviewChange?: (preview: CustomizerPreview | null) => void;
};

export type CustomizerTransform = {
  offsetX: number;
  offsetY: number;
  zoom: number;
  rotationDegrees: number;
};

export type CustomizerPrintArea = {
  x: number;
  y: number;
  width: number;
  height: number;
  shape: "rectangle" | "ellipse";
  borderRadius?: number;
};

export type CustomizerTemplate = {
  id: string;
  productSlug: string;
  productName: string;
  canvas: { width: number; height: number };
  printArea: CustomizerPrintArea;
  baseImageSrc?: string;
  overlayImageSrc?: string;
  limitation: string;
  visualStatus: "approved" | "fixture";
  fixtureStyle?: {
    background: string;
    printSurface: string;
    border: string;
    watermark: string;
  };
};

export type CustomizerProductSupport = {
  productSlug: string;
  productName: string;
  templateStatus: "awaiting-approved-assets" | "approved";
};

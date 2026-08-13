import type {
  CustomizerPrintArea,
  CustomizerTransform,
} from "@/types/customizer";

export const CUSTOMIZER_MIN_ZOOM = 0.25;
export const CUSTOMIZER_MAX_ZOOM = 4;

export const INITIAL_CUSTOMIZER_TRANSFORM: CustomizerTransform = Object.freeze({
  offsetX: 0,
  offsetY: 0,
  zoom: 1,
  rotationDegrees: 0,
});

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function clampCustomizerTransform(
  transform: CustomizerTransform,
  printArea: CustomizerPrintArea,
): CustomizerTransform {
  return {
    offsetX: clamp(transform.offsetX, -printArea.width, printArea.width),
    offsetY: clamp(transform.offsetY, -printArea.height, printArea.height),
    zoom: clamp(transform.zoom, CUSTOMIZER_MIN_ZOOM, CUSTOMIZER_MAX_ZOOM),
    rotationDegrees: clamp(transform.rotationDegrees, -180, 180),
  };
}

export function getCoverScale(
  image: { width: number; height: number },
  printArea: CustomizerPrintArea,
) {
  return Math.max(printArea.width / image.width, printArea.height / image.height);
}

export function cssDeltaToCanvasDelta(
  delta: { x: number; y: number },
  canvas: { width: number; height: number },
  bounds: { width: number; height: number },
) {
  if (bounds.width <= 0 || bounds.height <= 0) return { x: 0, y: 0 };
  return {
    x: delta.x * (canvas.width / bounds.width),
    y: delta.y * (canvas.height / bounds.height),
  };
}

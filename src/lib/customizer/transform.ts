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
  const offsetX = Number.isFinite(transform.offsetX) ? transform.offsetX : 0;
  const offsetY = Number.isFinite(transform.offsetY) ? transform.offsetY : 0;
  const zoom = Number.isFinite(transform.zoom)
    ? transform.zoom
    : INITIAL_CUSTOMIZER_TRANSFORM.zoom;
  const rotationDegrees = Number.isFinite(transform.rotationDegrees)
    ? transform.rotationDegrees
    : INITIAL_CUSTOMIZER_TRANSFORM.rotationDegrees;

  return {
    offsetX: clamp(offsetX, -printArea.width, printArea.width),
    offsetY: clamp(offsetY, -printArea.height, printArea.height),
    zoom: clamp(zoom, CUSTOMIZER_MIN_ZOOM, CUSTOMIZER_MAX_ZOOM),
    rotationDegrees: clamp(rotationDegrees, -180, 180),
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
  if (
    !Number.isFinite(delta.x) ||
    !Number.isFinite(delta.y) ||
    !Number.isFinite(canvas.width) ||
    !Number.isFinite(canvas.height) ||
    !Number.isFinite(bounds.width) ||
    !Number.isFinite(bounds.height) ||
    canvas.width <= 0 ||
    canvas.height <= 0 ||
    bounds.width <= 0 ||
    bounds.height <= 0
  ) {
    return { x: 0, y: 0 };
  }
  return {
    x: delta.x * (canvas.width / bounds.width),
    y: delta.y * (canvas.height / bounds.height),
  };
}

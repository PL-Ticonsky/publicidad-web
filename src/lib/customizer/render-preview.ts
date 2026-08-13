import { getCoverScale } from "@/lib/customizer/transform";
import type {
  CustomizerPrintArea,
  CustomizerTemplate,
  CustomizerTransform,
} from "@/types/customizer";

export type CustomizerRenderLayers = {
  base: CanvasImageSource | null;
  overlay: CanvasImageSource | null;
};

export const CUSTOMIZER_RENDER_ORDER = [
  "background",
  "base",
  "clipped-design",
  "overlay",
] as const;

function roundedRectanglePath(
  context: CanvasRenderingContext2D,
  area: CustomizerPrintArea,
) {
  const radius = Math.min(
    Math.max(area.borderRadius ?? 0, 0),
    area.width / 2,
    area.height / 2,
  );
  const right = area.x + area.width;
  const bottom = area.y + area.height;

  context.moveTo(area.x + radius, area.y);
  context.lineTo(right - radius, area.y);
  context.quadraticCurveTo(right, area.y, right, area.y + radius);
  context.lineTo(right, bottom - radius);
  context.quadraticCurveTo(right, bottom, right - radius, bottom);
  context.lineTo(area.x + radius, bottom);
  context.quadraticCurveTo(area.x, bottom, area.x, bottom - radius);
  context.lineTo(area.x, area.y + radius);
  context.quadraticCurveTo(area.x, area.y, area.x + radius, area.y);
}

export function createPrintAreaPath(
  context: CanvasRenderingContext2D,
  area: CustomizerPrintArea,
) {
  context.beginPath();
  if (area.shape === "ellipse") {
    context.ellipse(
      area.x + area.width / 2,
      area.y + area.height / 2,
      area.width / 2,
      area.height / 2,
      0,
      0,
      Math.PI * 2,
    );
  } else {
    roundedRectanglePath(context, area);
  }
  context.closePath();
}

function drawFixtureBase(
  context: CanvasRenderingContext2D,
  template: CustomizerTemplate,
) {
  if (!template.fixtureStyle) return;
  context.fillStyle = template.fixtureStyle.background;
  context.fillRect(0, 0, template.canvas.width, template.canvas.height);
  createPrintAreaPath(context, template.printArea);
  context.fillStyle = template.fixtureStyle.printSurface;
  context.fill();
}

function drawFixtureOverlay(
  context: CanvasRenderingContext2D,
  template: CustomizerTemplate,
) {
  if (!template.fixtureStyle) return;
  context.save();
  createPrintAreaPath(context, template.printArea);
  context.strokeStyle = template.fixtureStyle.border;
  context.lineWidth = 6;
  context.setLineDash([14, 10]);
  context.stroke();
  context.setLineDash([]);
  context.fillStyle = "rgba(27, 28, 26, 0.76)";
  context.font = "700 22px sans-serif";
  context.textAlign = "right";
  context.fillText(
    template.fixtureStyle.watermark,
    template.canvas.width - 24,
    template.canvas.height - 24,
  );
  context.restore();
}

export function renderCustomizerEmptyState(
  context: CanvasRenderingContext2D,
  template: CustomizerTemplate,
  layers: CustomizerRenderLayers,
) {
  const { width, height } = template.canvas;
  context.clearRect(0, 0, width, height);
  drawFixtureBase(context, template);
  if (layers.base) context.drawImage(layers.base, 0, 0, width, height);
  if (layers.overlay) context.drawImage(layers.overlay, 0, 0, width, height);
  drawFixtureOverlay(context, template);
}

export function renderCustomizerPreview(
  context: CanvasRenderingContext2D,
  template: CustomizerTemplate,
  design: { source: CanvasImageSource; width: number; height: number },
  transform: CustomizerTransform,
  layers: CustomizerRenderLayers,
) {
  const { width, height } = template.canvas;
  context.clearRect(0, 0, width, height);
  drawFixtureBase(context, template);

  if (layers.base) context.drawImage(layers.base, 0, 0, width, height);

  context.save();
  createPrintAreaPath(context, template.printArea);
  context.clip();

  const centerX = template.printArea.x + template.printArea.width / 2;
  const centerY = template.printArea.y + template.printArea.height / 2;
  const scale = getCoverScale(design, template.printArea) * transform.zoom;

  context.translate(centerX + transform.offsetX, centerY + transform.offsetY);
  context.rotate((transform.rotationDegrees * Math.PI) / 180);
  context.scale(scale, scale);
  context.drawImage(design.source, -design.width / 2, -design.height / 2);
  context.restore();

  if (layers.overlay) context.drawImage(layers.overlay, 0, 0, width, height);
  drawFixtureOverlay(context, template);
}

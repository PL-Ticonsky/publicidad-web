import { describe, expect, it, vi } from "vitest";
import {
  CUSTOMIZER_RENDER_ORDER,
  renderCustomizerPreview,
} from "@/lib/customizer/render-preview";
import type { CustomizerTemplate } from "@/types/customizer";

const template: CustomizerTemplate = {
  id: "approved-test-template",
  productSlug: "llavero-metalico-redondo",
  productName: "Llavero metálico redondo",
  canvas: { width: 800, height: 600 },
  printArea: {
    x: 100,
    y: 75,
    width: 600,
    height: 450,
    shape: "rectangle",
    borderRadius: 24,
  },
  limitation: "Prueba",
  visualStatus: "approved",
};

function recordingContext() {
  const calls: string[] = [];
  const context = {
    beginPath: vi.fn(() => calls.push("begin-path")),
    clearRect: vi.fn(() => calls.push("clear")),
    closePath: vi.fn(() => calls.push("close-path")),
    clip: vi.fn(() => calls.push("clip")),
    drawImage: vi.fn((source: { id?: string }) =>
      calls.push(`draw-${source.id ?? "unknown"}`),
    ),
    ellipse: vi.fn(() => calls.push("ellipse")),
    lineTo: vi.fn(),
    moveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    restore: vi.fn(() => calls.push("restore")),
    rotate: vi.fn(),
    save: vi.fn(() => calls.push("save")),
    scale: vi.fn(),
    translate: vi.fn(),
  };

  return {
    calls,
    context: context as unknown as CanvasRenderingContext2D,
  };
}

describe("customizer rendering", () => {
  it("keeps the render contract explicit", () => {
    expect(CUSTOMIZER_RENDER_ORDER).toEqual([
      "background",
      "base",
      "clipped-design",
      "overlay",
    ]);
  });

  it("clips the design before drawing it and restores before the overlay", () => {
    const { calls, context } = recordingContext();
    const base = { id: "base" } as unknown as CanvasImageSource;
    const design = { id: "design" } as unknown as CanvasImageSource;
    const overlay = { id: "overlay" } as unknown as CanvasImageSource;

    renderCustomizerPreview(
      context,
      template,
      { source: design, width: 1_200, height: 600 },
      { offsetX: 0, offsetY: 0, zoom: 1, rotationDegrees: 0 },
      { base, overlay },
    );

    expect(calls.indexOf("draw-base")).toBeLessThan(calls.indexOf("clip"));
    expect(calls.indexOf("clip")).toBeLessThan(calls.indexOf("draw-design"));
    expect(calls.indexOf("draw-design")).toBeLessThan(calls.indexOf("restore"));
    expect(calls.indexOf("restore")).toBeLessThan(calls.indexOf("draw-overlay"));
  });
});

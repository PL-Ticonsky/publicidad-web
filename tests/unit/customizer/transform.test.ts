import { describe, expect, it } from "vitest";
import {
  clampCustomizerTransform,
  cssDeltaToCanvasDelta,
  getCoverScale,
  INITIAL_CUSTOMIZER_TRANSFORM,
} from "@/lib/customizer/transform";
import type { CustomizerPrintArea } from "@/types/customizer";

const area: CustomizerPrintArea = {
  x: 100,
  y: 75,
  width: 600,
  height: 450,
  shape: "rectangle",
};

describe("customizer transforms", () => {
  it("computes cover scale and defines the centered reset transform", () => {
    expect(getCoverScale({ width: 1_200, height: 600 }, area)).toBe(0.75);
    expect(INITIAL_CUSTOMIZER_TRANSFORM).toEqual({
      offsetX: 0,
      offsetY: 0,
      zoom: 1,
      rotationDegrees: 0,
    });
  });

  it("clamps translation, scale and rotation", () => {
    expect(
      clampCustomizerTransform(
        { offsetX: 900, offsetY: -900, zoom: 10, rotationDegrees: -300 },
        area,
      ),
    ).toEqual({
      offsetX: 600,
      offsetY: -450,
      zoom: 4,
      rotationDegrees: -180,
    });
  });

  it("normalizes non-finite transform input before it reaches canvas", () => {
    expect(
      clampCustomizerTransform(
        {
          offsetX: Number.NaN,
          offsetY: Number.POSITIVE_INFINITY,
          zoom: Number.NaN,
          rotationDegrees: Number.NEGATIVE_INFINITY,
        },
        area,
      ),
    ).toEqual(INITIAL_CUSTOMIZER_TRANSFORM);
  });

  it("converts pointer movement into canvas coordinates safely", () => {
    expect(
      cssDeltaToCanvasDelta(
        { x: 20, y: -10 },
        { width: 800, height: 600 },
        { width: 400, height: 300 },
      ),
    ).toEqual({ x: 40, y: -20 });

    expect(
      cssDeltaToCanvasDelta(
        { x: Number.NaN, y: 10 },
        { width: 800, height: 600 },
        { width: 400, height: 300 },
      ),
    ).toEqual({ x: 0, y: 0 });
  });
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  clampCustomizerTransform,
  cssDeltaToCanvasDelta,
  getCoverScale,
  INITIAL_CUSTOMIZER_TRANSFORM,
} from "./transform";
import type { CustomizerPrintArea } from "@/types/customizer";

const area: CustomizerPrintArea = {
  x: 100,
  y: 75,
  width: 600,
  height: 450,
  shape: "rectangle",
};

test("computes cover scale and preserves the reset transform", () => {
  assert.equal(getCoverScale({ width: 1200, height: 600 }, area), 0.75);
  assert.deepEqual(INITIAL_CUSTOMIZER_TRANSFORM, {
    offsetX: 0,
    offsetY: 0,
    zoom: 1,
    rotationDegrees: 0,
  });
});

test("clamps translation, scale and rotation to finite interaction limits", () => {
  assert.deepEqual(
    clampCustomizerTransform(
      { offsetX: 900, offsetY: -900, zoom: 10, rotationDegrees: -300 },
      area,
    ),
    { offsetX: 600, offsetY: -450, zoom: 4, rotationDegrees: -180 },
  );
});

test("converts pointer movement from CSS pixels into canvas coordinates", () => {
  assert.deepEqual(
    cssDeltaToCanvasDelta(
      { x: 20, y: -10 },
      { width: 800, height: 600 },
      { width: 400, height: 300 },
    ),
    { x: 40, y: -20 },
  );
  assert.deepEqual(
    cssDeltaToCanvasDelta(
      { x: 20, y: 10 },
      { width: 800, height: 600 },
      { width: 0, height: 300 },
    ),
    { x: 0, y: 0 },
  );
});

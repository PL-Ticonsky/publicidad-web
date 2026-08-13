import assert from "node:assert/strict";
import test from "node:test";
import { CUSTOMIZER_RENDER_ORDER } from "./render-preview";

test("keeps the required base, clipped design and overlay order explicit", () => {
  assert.deepEqual(CUSTOMIZER_RENDER_ORDER, [
    "background",
    "base",
    "clipped-design",
    "overlay",
  ]);
});

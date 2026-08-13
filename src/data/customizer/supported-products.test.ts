import assert from "node:assert/strict";
import test from "node:test";
import {
  CUSTOMIZER_PRODUCT_SUPPORT,
  getApprovedCustomizerTemplate,
  isCustomizerProductSupported,
} from "./supported-products";

test("uses an explicit allow-list for the three keychains and mouse pad", () => {
  assert.deepEqual(
    CUSTOMIZER_PRODUCT_SUPPORT.map((product) => product.productSlug),
    [
      "llavero-metalico-redondo",
      "llavero-acrilico-personalizado",
      "llavero-destapador-corporativo",
      "mouse-pad-personalizado-rectangular",
    ],
  );
  assert.equal(isCustomizerProductSupported("llavero-metalico-redondo"), true);
  assert.equal(isCustomizerProductSupported("mouse-pad-falso"), false);
});

test("does not promote demo fixtures to approved commercial templates", () => {
  for (const product of CUSTOMIZER_PRODUCT_SUPPORT) {
    assert.equal(getApprovedCustomizerTemplate(product.productSlug), undefined);
  }
});

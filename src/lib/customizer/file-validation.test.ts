import assert from "node:assert/strict";
import test from "node:test";
import {
  CUSTOMIZER_MAX_FILE_BYTES,
  CUSTOMIZER_MAX_PIXELS,
  CustomizerFileError,
  matchesDeclaredImageSignature,
  validateCustomizerFileEnvelope,
  validateDecodedDimensions,
} from "./file-validation";

const signatures = {
  "image/png": new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]),
  "image/jpeg": new Uint8Array([255, 216, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0]),
  "image/webp": new Uint8Array([82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80]),
} as const;

function makeFile(bytes: Uint8Array, type: string, size = bytes.byteLength) {
  const padding = Math.max(0, size - bytes.byteLength);
  return new File(
    [new Uint8Array(bytes).buffer, new ArrayBuffer(padding)],
    "fixture.bin",
    { type },
  );
}

for (const [mimeType, bytes] of Object.entries(signatures)) {
  test(`accepts a matching ${mimeType} signature`, async () => {
    await assert.doesNotReject(validateCustomizerFileEnvelope(makeFile(bytes, mimeType)));
  });
}

test("rejects SVG by MIME even when its extension is disguised", async () => {
  const file = new File(["<svg/>"] , "disfraz.png", { type: "image/svg+xml" });
  await assert.rejects(validateCustomizerFileEnvelope(file), (error) => {
    return error instanceof CustomizerFileError && error.code === "invalid-type";
  });
});

test("rejects a MIME/signature mismatch", async () => {
  await assert.rejects(
    validateCustomizerFileEnvelope(makeFile(signatures["image/jpeg"], "image/png")),
    (error) => error instanceof CustomizerFileError && error.code === "invalid-signature",
  );
});

test("accepts 10 MiB exactly and rejects one extra byte", async () => {
  await assert.doesNotReject(
    validateCustomizerFileEnvelope(
      makeFile(signatures["image/png"], "image/png", CUSTOMIZER_MAX_FILE_BYTES),
    ),
  );
  await assert.rejects(
    validateCustomizerFileEnvelope(
      makeFile(signatures["image/png"], "image/png", CUSTOMIZER_MAX_FILE_BYTES + 1),
    ),
    (error) => error instanceof CustomizerFileError && error.code === "file-too-large",
  );
});

test("checks decoded dimensions without unsafe pixel multiplication", () => {
  assert.doesNotThrow(() => validateDecodedDimensions(5_000, 5_000));
  assert.throws(
    () => validateDecodedDimensions(CUSTOMIZER_MAX_PIXELS + 1, 1),
    (error) => error instanceof CustomizerFileError && error.code === "too-many-pixels",
  );
  assert.throws(
    () => validateDecodedDimensions(0, 100),
    (error) => error instanceof CustomizerFileError && error.code === "invalid-dimensions",
  );
});

test("signature helper rejects truncated or unrelated bytes", () => {
  assert.equal(matchesDeclaredImageSignature("image/png", new Uint8Array([137, 80])), false);
  assert.equal(matchesDeclaredImageSignature("image/jpeg", new Uint8Array([0, 1, 2])), false);
  assert.equal(matchesDeclaredImageSignature("image/webp", new Uint8Array(12)), false);
});

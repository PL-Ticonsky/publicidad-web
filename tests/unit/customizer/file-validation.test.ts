import { describe, expect, it } from "vitest";
import {
  CUSTOMIZER_MAX_FILE_BYTES,
  CUSTOMIZER_MAX_PIXELS,
  CustomizerFileError,
  matchesDeclaredImageSignature,
  validateCustomizerFileEnvelope,
  validateDecodedDimensions,
} from "@/lib/customizer/file-validation";

const signatures = {
  "image/png": new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]),
  "image/jpeg": new Uint8Array([255, 216, 255, 224, 0, 0, 0, 0, 0, 0, 0, 0]),
  "image/webp": new Uint8Array([82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80]),
} as const;

function makeFile(bytes: Uint8Array, type: string, size = bytes.byteLength) {
  const padding = Math.max(0, size - bytes.byteLength);
  return new File(
    [bytes.slice().buffer, new ArrayBuffer(padding)],
    "fixture.bin",
    { type },
  );
}

describe("customizer file validation", () => {
  it.each(Object.entries(signatures))(
    "accepts matching MIME and signature for %s",
    async (mimeType, bytes) => {
      await expect(
        validateCustomizerFileEnvelope(makeFile(bytes, mimeType)),
      ).resolves.toBe(mimeType);
    },
  );

  it("rejects SVG even when its extension is disguised", async () => {
    const file = new File(["<svg/>"] , "disfraz.png", {
      type: "image/svg+xml",
    });

    await expect(validateCustomizerFileEnvelope(file)).rejects.toMatchObject({
      code: "invalid-type",
    });
  });

  it("rejects MIME/signature mismatches and truncated headers", async () => {
    await expect(
      validateCustomizerFileEnvelope(
        makeFile(signatures["image/jpeg"], "image/png"),
      ),
    ).rejects.toMatchObject({ code: "invalid-signature" });

    expect(
      matchesDeclaredImageSignature("image/png", new Uint8Array([137, 80])),
    ).toBe(false);
    expect(
      matchesDeclaredImageSignature("image/jpeg", new Uint8Array([0, 1, 2])),
    ).toBe(false);
    expect(
      matchesDeclaredImageSignature("image/webp", new Uint8Array(12)),
    ).toBe(false);
  });

  it("accepts 10 MiB exactly and rejects one extra byte", async () => {
    await expect(
      validateCustomizerFileEnvelope(
        makeFile(
          signatures["image/png"],
          "image/png",
          CUSTOMIZER_MAX_FILE_BYTES,
        ),
      ),
    ).resolves.toBe("image/png");

    await expect(
      validateCustomizerFileEnvelope(
        makeFile(
          signatures["image/png"],
          "image/png",
          CUSTOMIZER_MAX_FILE_BYTES + 1,
        ),
      ),
    ).rejects.toMatchObject({ code: "file-too-large" });
  });

  it("accepts 25 megapixels and rejects larger or invalid dimensions", () => {
    expect(() => validateDecodedDimensions(5_000, 5_000)).not.toThrow();
    expect(() =>
      validateDecodedDimensions(CUSTOMIZER_MAX_PIXELS + 1, 1),
    ).toThrowError(expect.objectContaining({ code: "too-many-pixels" }));

    for (const dimensions of [
      [0, 100],
      [100, 0],
      [Number.NaN, 100],
      [100.5, 100],
    ] as const) {
      expect(() =>
        validateDecodedDimensions(dimensions[0], dimensions[1]),
      ).toThrowError(CustomizerFileError);
    }
  });
});

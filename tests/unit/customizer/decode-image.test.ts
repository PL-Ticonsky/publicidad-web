import { afterEach, describe, expect, it, vi } from "vitest";
import { decodeCustomizerImage } from "@/lib/customizer/decode-image";

const pngSignature = new Uint8Array([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0,
]);

function validPng() {
  return new File([pngSignature.slice().buffer], "arte.png", {
    type: "image/png",
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("decodeCustomizerImage", () => {
  it("uses real browser decoding metadata and releases the bitmap", async () => {
    const close = vi.fn();
    const createImageBitmap = vi.fn().mockResolvedValue({
      width: 2_000,
      height: 1_000,
      close,
    });
    vi.stubGlobal("createImageBitmap", createImageBitmap);

    const decoded = await decodeCustomizerImage(validPng());

    expect(createImageBitmap).toHaveBeenCalledOnce();
    expect(decoded).toMatchObject({ width: 2_000, height: 1_000 });
    decoded.dispose();
    expect(close).toHaveBeenCalledOnce();
  });

  it("rejects dimensions above 25 megapixels and closes the bitmap", async () => {
    const close = vi.fn();
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn().mockResolvedValue({ width: 5_001, height: 5_000, close }),
    );

    await expect(decodeCustomizerImage(validPng())).rejects.toMatchObject({
      code: "too-many-pixels",
    });
    expect(close).toHaveBeenCalledOnce();
  });

  it("turns browser decode failures into a correctable public error", async () => {
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn().mockRejectedValue(new DOMException("corrupt")),
    );

    await expect(decodeCustomizerImage(validPng())).rejects.toMatchObject({
      code: "decode-failed",
      message: expect.stringContaining("no pudo leer la imagen"),
    });
  });
});

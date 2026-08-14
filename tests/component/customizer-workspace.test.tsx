import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CustomizerWorkspace } from "@/components/customizer/customizer-workspace";
import { ProductCustomizer } from "@/components/customizer/product-customizer";
import { getCustomizerDemoFixture } from "@/data/customizer/demo-fixtures";
import { CustomizerFileError } from "@/lib/customizer/file-validation";
import type { DecodedCustomizerImage } from "@/lib/customizer/decode-image";

const mocks = vi.hoisted(() => ({
  decode: vi.fn(),
  emptyRender: vi.fn(),
  loadLayers: vi.fn(),
  previewRender: vi.fn(),
}));

vi.mock("@/lib/customizer/decode-image", () => ({
  decodeCustomizerImage: mocks.decode,
}));

vi.mock("@/lib/customizer/render-preview", () => ({
  renderCustomizerEmptyState: mocks.emptyRender,
  renderCustomizerPreview: mocks.previewRender,
}));

vi.mock("@/lib/customizer/template-assets", () => ({
  loadCustomizerTemplateLayers: mocks.loadLayers,
}));

const template = getCustomizerDemoFixture("llavero-metalico-redondo");
if (!template) throw new Error("Missing customizer test fixture");

const originalCreateObjectUrl = Object.getOwnPropertyDescriptor(
  URL,
  "createObjectURL",
);
const originalRevokeObjectUrl = Object.getOwnPropertyDescriptor(
  URL,
  "revokeObjectURL",
);

const createObjectUrl = vi.fn<(blob: Blob) => string>();
const revokeObjectUrl = vi.fn<(url: string) => void>();
const canvasContext = {} as CanvasRenderingContext2D;
let nextObjectUrl = 0;

function decodedImage(
  dispose = vi.fn(),
): DecodedCustomizerImage & { dispose: ReturnType<typeof vi.fn> } {
  return {
    source: {} as CanvasImageSource,
    width: 24,
    height: 12,
    dispose,
  };
}

function imageFile(name = "arte.png") {
  return new File([new Uint8Array([1, 2, 3])], name, {
    type: "image/png",
  });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });
  return { promise, resolve };
}

beforeEach(() => {
  nextObjectUrl = 0;
  createObjectUrl.mockReset();
  createObjectUrl.mockImplementation(() => `blob:preview-${++nextObjectUrl}`);
  revokeObjectUrl.mockReset();
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: createObjectUrl,
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value: revokeObjectUrl,
  });

  mocks.decode.mockReset();
  mocks.emptyRender.mockReset();
  mocks.previewRender.mockReset();
  mocks.loadLayers.mockReset();
  mocks.loadLayers.mockResolvedValue({
    base: null,
    overlay: null,
    dispose: vi.fn(),
  });

  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    () => canvasContext,
  );
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
    (callback) => callback(new Blob(["png"], { type: "image/png" })),
  );
});

afterAll(() => {
  if (originalCreateObjectUrl) {
    Object.defineProperty(URL, "createObjectURL", originalCreateObjectUrl);
  } else {
    Reflect.deleteProperty(URL, "createObjectURL");
  }
  if (originalRevokeObjectUrl) {
    Object.defineProperty(URL, "revokeObjectURL", originalRevokeObjectUrl);
  } else {
    Reflect.deleteProperty(URL, "revokeObjectURL");
  }
});

describe("CustomizerWorkspace", () => {
  it("moves through empty, processing and ready while emitting a PNG preview", async () => {
    const user = userEvent.setup();
    const pendingDecode = deferred<DecodedCustomizerImage>();
    const image = decodedImage();
    const onPreviewChange = vi.fn();
    mocks.decode.mockReturnValue(pendingDecode.promise);

    render(
      <CustomizerWorkspace
        template={template}
        onPreviewChange={onPreviewChange}
      />,
    );

    expect(screen.getByText("Carga una imagen para comenzar.")).toBeVisible();
    await user.upload(
      screen.getByLabelText("Imagen PNG, JPEG o WebP"),
      imageFile("identidad.webp"),
    );
    expect(screen.getByText(/Procesando la imagen/)).toBeVisible();

    await act(async () => pendingDecode.resolve(image));

    expect(await screen.findByText("identidad.webp")).toBeVisible();
    await waitFor(() => {
      expect(onPreviewChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          productSlug: "llavero-metalico-redondo",
          sourceFileName: "identidad.webp",
          previewBlob: expect.objectContaining({ type: "image/png" }),
          previewObjectUrl: "blob:preview-1",
          width: 800,
          height: 600,
        }),
      );
    });
    expect(screen.getByRole("button", { name: "Descargar PNG" })).toBeEnabled();
  });

  it("replaces and removes images while disposing sources and revoking URLs", async () => {
    const user = userEvent.setup();
    const first = decodedImage();
    const second = decodedImage();
    const onPreviewChange = vi.fn();
    mocks.decode.mockResolvedValueOnce(first).mockResolvedValueOnce(second);

    const view = render(
      <CustomizerWorkspace
        template={template}
        onPreviewChange={onPreviewChange}
      />,
    );
    const input = screen.getByLabelText("Imagen PNG, JPEG o WebP");

    await user.upload(input, imageFile("primera.png"));
    expect(await screen.findByText("primera.png")).toBeVisible();
    await waitFor(() => expect(createObjectUrl).toHaveBeenCalledTimes(1));

    await user.upload(input, imageFile("segunda.png"));
    expect(await screen.findByText("segunda.png")).toBeVisible();
    expect(first.dispose).toHaveBeenCalledOnce();
    await waitFor(() => expect(revokeObjectUrl).toHaveBeenCalledWith("blob:preview-1"));

    await user.click(screen.getByRole("button", { name: "Eliminar imagen" }));
    expect(second.dispose).toHaveBeenCalledOnce();
    expect(screen.getByText("Carga una imagen para comenzar.")).toBeVisible();
    expect(onPreviewChange).toHaveBeenLastCalledWith(null);
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:preview-2");

    view.unmount();
  });

  it("keeps centering separate from a full accessible reset", async () => {
    const user = userEvent.setup();
    mocks.decode.mockResolvedValue(decodedImage());
    render(<CustomizerWorkspace template={template} />);

    await user.upload(
      screen.getByLabelText("Imagen PNG, JPEG o WebP"),
      imageFile(),
    );
    await screen.findByText("arte.png");

    fireEvent.change(screen.getByLabelText("Zoom"), {
      target: { value: "175" },
    });
    fireEvent.change(screen.getByLabelText("Rotación"), {
      target: { value: "45" },
    });
    await user.click(screen.getByRole("button", { name: "Mover imagen a la derecha" }));
    await user.click(screen.getByRole("button", { name: "Centrar imagen" }));

    await waitFor(() => {
      const transform = mocks.previewRender.mock.calls.at(-1)?.[3];
      expect(transform).toEqual({
        offsetX: 0,
        offsetY: 0,
        zoom: 1.75,
        rotationDegrees: 45,
      });
    });

    await user.click(screen.getByRole("button", { name: "Restablecer ajustes" }));
    expect(screen.getByText("100%")).toBeVisible();
    expect(screen.getByText("0°")).toBeVisible();
  });

  it("disables stale downloads until the current PNG is ready", async () => {
    const user = userEvent.setup();
    const onPreviewChange = vi.fn();
    mocks.decode.mockResolvedValue(decodedImage());
    render(
      <CustomizerWorkspace
        template={template}
        onPreviewChange={onPreviewChange}
      />,
    );

    await user.upload(
      screen.getByLabelText("Imagen PNG, JPEG o WebP"),
      imageFile(),
    );
    await screen.findByRole("button", { name: "Descargar PNG" });

    let finishPng!: BlobCallback;
    vi.mocked(HTMLCanvasElement.prototype.toBlob).mockImplementationOnce(
      (callback) => {
        finishPng = callback;
      },
    );
    fireEvent.change(screen.getByLabelText("Zoom"), {
      target: { value: "125" },
    });

    expect(
      screen.getByRole("button", { name: "Preparando PNG…" }),
    ).toBeDisabled();
    expect(onPreviewChange).toHaveBeenLastCalledWith(null);
    act(() => finishPng(new Blob(["current"], { type: "image/png" })));
    expect(
      await screen.findByRole("button", { name: "Descargar PNG" }),
    ).toBeEnabled();
    expect(onPreviewChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ previewObjectUrl: "blob:preview-2" }),
    );
  });

  it("ignores PNG callbacks that finish after image removal", async () => {
    const user = userEvent.setup();
    const onPreviewChange = vi.fn();
    let finishPng!: BlobCallback;
    mocks.decode.mockResolvedValue(decodedImage());
    vi.mocked(HTMLCanvasElement.prototype.toBlob).mockImplementationOnce(
      (callback) => {
        finishPng = callback;
      },
    );
    render(
      <CustomizerWorkspace
        template={template}
        onPreviewChange={onPreviewChange}
      />,
    );

    await user.upload(
      screen.getByLabelText("Imagen PNG, JPEG o WebP"),
      imageFile(),
    );
    await screen.findByText("arte.png");
    await user.click(screen.getByRole("button", { name: "Eliminar imagen" }));
    act(() => finishPng(new Blob(["late"], { type: "image/png" })));

    expect(createObjectUrl).not.toHaveBeenCalled();
    expect(onPreviewChange).toHaveBeenLastCalledWith(null);
  });

  it("downloads the generated blob URL and revokes it on unmount", async () => {
    const user = userEvent.setup();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click");
    mocks.decode.mockResolvedValue(decodedImage());
    const view = render(<CustomizerWorkspace template={template} />);

    await user.upload(
      screen.getByLabelText("Imagen PNG, JPEG o WebP"),
      imageFile("Mi logo final.PNG"),
    );
    await user.click(
      await screen.findByRole("button", { name: "Descargar PNG" }),
    );

    expect(click).toHaveBeenCalledOnce();
    const anchor = click.mock.instances[0] as HTMLAnchorElement;
    expect(anchor.download).toBe("Mi-logo-final-previsualizacion.png");
    expect(anchor.href).toBe("blob:preview-1");

    view.unmount();
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:preview-1");
  });

  it("announces correctable file errors and keeps replacement available", async () => {
    const user = userEvent.setup();
    mocks.decode.mockRejectedValue(
      new CustomizerFileError(
        "decode-failed",
        "El navegador no pudo leer la imagen. Comprueba el archivo o expórtalo de nuevo.",
      ),
    );
    render(<CustomizerWorkspace template={template} />);

    await user.upload(
      screen.getByLabelText("Imagen PNG, JPEG o WebP"),
      imageFile("corrupta.png"),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "no pudo leer la imagen",
    );
    expect(screen.getByLabelText("Imagen PNG, JPEG o WebP")).toBeEnabled();
  });
});

describe("ProductCustomizer guards", () => {
  it("blocks pending commercial assets and unsupported products", () => {
    const onPendingPreview = vi.fn();
    const { rerender } = render(
      <ProductCustomizer
        productSlug="llavero-metalico-redondo"
        onPreviewChange={onPendingPreview}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /Plantilla visual pendiente/ }),
    ).toBeVisible();
    expect(onPendingPreview).toHaveBeenCalledWith(null);

    rerender(
      <ProductCustomizer
        productSlug="producto-no-soportado"
        onPreviewChange={onPendingPreview}
      />,
    );
    expect(
      screen.getByRole("heading", {
        name: "Este producto no admite previsualización",
      }),
    ).toBeVisible();
  });
});

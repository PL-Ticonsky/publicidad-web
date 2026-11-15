import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  CustomizerPreviewProvider,
  useCustomizerPreview,
} from "@/components/personalization/customizer-preview-provider";
import { ProductCustomizationFlow } from "@/components/personalization/product-customization-flow";
import { ProductQuoteCalculator } from "@/components/product-quote-calculator";
import type { CustomizerPreview } from "@/types/customizer";
import { productFixture } from "../fixtures/quotation";

vi.mock("@/components/product-image", () => ({
  ProductImage: ({ alt }: { alt: string }) => <div role="img" aria-label={alt} />,
}));

vi.mock("@/components/customizer", () => ({
  ProductCustomizer: ({
    productSlug,
    onPreviewChange,
  }: {
    productSlug: string;
    onPreviewChange?: (preview: CustomizerPreview | null) => void;
  }) => (
    <div aria-label="Motor del personalizador">
      <button
        type="button"
        onClick={() => onPreviewChange?.({
          productSlug,
          sourceFileName: "logo empresa.png",
          previewBlob: new Blob(["png-preview"], { type: "image/png" }),
          previewObjectUrl: "blob:engine-owned",
          width: 1_200,
          height: 900,
        })}
      >
        Emitir previsualización
      </button>
      <button
        type="button"
        onClick={() => onPreviewChange?.({
          productSlug,
          sourceFileName: "reemplazo.jpg",
          previewBlob: new Blob(["replacement-preview"], { type: "image/png" }),
          previewObjectUrl: "blob:engine-replacement",
          width: 1_200,
          height: 900,
        })}
      >
        Emitir reemplazo
      </button>
      <button type="button" onClick={() => onPreviewChange?.(null)}>Simular exportación fallida</button>
    </div>
  ),
}));

const mousePad = productFixture("mouse-pad-personalizado-rectangular");

function PreviewProbe() {
  const { preview, downloaded } = useCustomizerPreview();
  return <output aria-label="Estado compartido">{preview ? `${preview.sourceFileName}|${preview.previewObjectUrl}|${downloaded}` : "vacío"}</output>;
}

function SeedPreview({ preview }: { preview: CustomizerPreview }) {
  const { confirmPreview } = useCustomizerPreview();
  useEffect(() => {
    confirmPreview(preview);
  }, [confirmPreview, preview]);
  return null;
}

function readyPreview(productSlug = mousePad.slug): CustomizerPreview {
  return {
    productSlug,
    sourceFileName: "arte-final.webp",
    previewBlob: new Blob(["png-preview"], { type: "image/png" }),
    previewObjectUrl: "blob:engine-owned",
    width: 1_200,
    height: 900,
  };
}

async function completeRequiredFields() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Nombre *"), "María José");
  await user.type(screen.getByLabelText("Ciudad *"), "Bogotá");
  return user;
}

describe("integración del personalizador", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "573001234567");
    let objectUrlId = 0;
    vi.spyOn(URL, "createObjectURL").mockImplementation(() => `blob:integration-${++objectUrlId}`);
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  });

  it("confirma el Blob con una URL propia antes de continuar de ruta", async () => {
    render(
      <CustomizerPreviewProvider>
        <ProductCustomizationFlow product={mousePad} previewAvailable />
        <PreviewProbe />
      </CustomizerPreviewProvider>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Emitir previsualización" }));
    expect(screen.getByRole("heading", { name: "Previsualización lista" })).toBeVisible();
    expect(screen.getByText(/logo empresa\.png/)).toBeVisible();

    const continueLink = screen.getByRole("link", { name: "Confirmar y continuar" });
    continueLink.addEventListener("click", (event) => event.preventDefault());
    await user.click(continueLink);

    expect(screen.getByLabelText("Estado compartido")).toHaveTextContent("logo empresa.png|blob:integration-1|false");
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  });

  it("no conserva ni anuncia una exportación fallida", async () => {
    render(
      <CustomizerPreviewProvider>
        <ProductCustomizationFlow product={mousePad} previewAvailable />
        <PreviewProbe />
      </CustomizerPreviewProvider>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Emitir previsualización" }));
    await user.click(screen.getByRole("button", { name: "Simular exportación fallida" }));
    expect(screen.queryByRole("heading", { name: "Previsualización lista" })).not.toBeInTheDocument();

    const continueLink = screen.getByRole("link", { name: "Continuar al cotizador" });
    continueLink.addEventListener("click", (event) => event.preventDefault());
    await user.click(continueLink);
    expect(screen.getByLabelText("Estado compartido")).toHaveTextContent("vacío");
  });

  it("confirma únicamente la previsualización del archivo más reciente", async () => {
    render(
      <CustomizerPreviewProvider>
        <ProductCustomizationFlow product={mousePad} previewAvailable />
        <PreviewProbe />
      </CustomizerPreviewProvider>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Emitir previsualización" }));
    await user.click(screen.getByRole("button", { name: "Emitir reemplazo" }));
    expect(screen.getByText(/reemplazo\.jpg/)).toBeVisible();
    expect(screen.queryByText(/logo empresa\.png/)).not.toBeInTheDocument();

    const continueLink = screen.getByRole("link", { name: "Confirmar y continuar" });
    continueLink.addEventListener("click", (event) => event.preventDefault());
    await user.click(continueLink);
    expect(screen.getByLabelText("Estado compartido")).toHaveTextContent("reemplazo.jpg|blob:integration-1|false");
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  });

  it("descarga el PNG manualmente una vez y abre WhatsApp una vez con la instrucción", async () => {
    const preview = readyPreview();
    render(
      <CustomizerPreviewProvider>
        <SeedPreview preview={preview} />
        <ProductQuoteCalculator product={mousePad} />
      </CustomizerPreviewProvider>,
    );

    const previewRegion = await screen.findByLabelText("Previsualización personalizada");
    expect(previewRegion).toHaveTextContent("Previsualización lista");
    expect(previewRegion).toHaveTextContent("arte-final.webp");

    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    const downloadButton = screen.getByRole("button", { name: "Descargar PNG" });
    fireEvent.click(downloadButton);
    fireEvent.click(downloadButton);
    expect(anchorClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "PNG descargado" })).toBeDisabled();

    await completeRequiredFields();
    const open = vi.spyOn(window, "open").mockReturnValue({} as Window);
    const form = screen.getByRole("region", { name: "Desglose de la solicitud" }).closest("form");
    fireEvent.submit(form as HTMLFormElement);
    fireEvent.submit(form as HTMLFormElement);

    expect(open).toHaveBeenCalledTimes(1);
    const openedUrl = new URL(String(open.mock.calls[0]?.[0]));
    const message = openedUrl.searchParams.get("text") ?? "";
    expect(message).toContain("Previsualización lista: Sí");
    expect(message).toContain("debo descargar y adjuntar manualmente el archivo PNG");
  });

  it("no mezcla una previsualización con otro producto", async () => {
    const unsupportedProduct = productFixture("llavero-destapador-corporativo");
    render(
      <CustomizerPreviewProvider>
        <SeedPreview preview={readyPreview()} />
        <ProductQuoteCalculator product={unsupportedProduct} />
      </CustomizerPreviewProvider>,
    );
    await waitFor(() => expect(screen.queryByLabelText("Previsualización personalizada")).not.toBeInTheDocument());
    expect(screen.getByText("Archivo o referencia gráfica")).toBeVisible();

    await completeRequiredFields();
    const open = vi.spyOn(window, "open").mockReturnValue({} as Window);
    fireEvent.submit(screen.getByRole("region", { name: "Desglose de la solicitud" }).closest("form") as HTMLFormElement);
    const message = new URL(String(open.mock.calls[0]?.[0])).searchParams.get("text") ?? "";
    expect(message).not.toContain("PREVISUALIZACIÓN");
    expect(message).not.toContain("archivo PNG");
  });

  it("el estado desaparece al desmontar y crear una nueva sesión en memoria", async () => {
    const firstSession = render(
      <CustomizerPreviewProvider>
        <SeedPreview preview={readyPreview()} />
        <PreviewProbe />
      </CustomizerPreviewProvider>,
    );
    await waitFor(() => expect(screen.getByLabelText("Estado compartido")).toHaveTextContent("arte-final.webp"));
    firstSession.unmount();

    render(
      <CustomizerPreviewProvider>
        <PreviewProbe />
      </CustomizerPreviewProvider>,
    );
    expect(screen.getByLabelText("Estado compartido")).toHaveTextContent("vacío");
  });
});

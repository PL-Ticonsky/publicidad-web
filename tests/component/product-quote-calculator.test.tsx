import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProductQuoteCalculator } from "@/components/product-quote-calculator";
import { CustomizerPreviewProvider } from "@/components/personalization/customizer-preview-provider";
import { calculateQuote } from "@/lib/quotation/calculate-quote";
import { presentQuote } from "@/lib/quotation/present-quote";
import { productFixture } from "../fixtures/quotation";

vi.mock("@/components/product-image", () => ({
  ProductImage: ({ alt }: { alt: string }) => <div role="img" aria-label={alt} />,
}));

const product = productFixture("mouse-pad-personalizado-rectangular");

async function completeRequiredFields() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Nombre *"), "María José");
  await user.type(screen.getByLabelText("Ciudad *"), "Bogotá");
  return user;
}

function renderCalculator() {
  return render(
    <CustomizerPreviewProvider>
      <ProductQuoteCalculator product={product} />
    </CustomizerPreviewProvider>,
  );
}

describe("ProductQuoteCalculator", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_WHATSAPP_NUMBER", "573001234567");
  });

  it("mantiene el desglose completo en el DOM móvil y aclara el precio desde", () => {
    renderCalculator();
    const summary = screen.getByRole("region", { name: "Desglose de la solicitud" });
    expect(summary).toBeVisible();
    expect(summary).not.toHaveClass("hidden");
    expect(screen.getByText(/“Desde” corresponde al tramo de mayor volumen/)).toBeVisible();
    expect(screen.queryByText(/#001/)).not.toBeInTheDocument();
  });

  it("muestra errores para espacios, teléfono y email inválidos", async () => {
    renderCalculator();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Nombre *"), "   ");
    await user.tab();
    await user.type(screen.getByLabelText("Ciudad *"), "   ");
    await user.tab();
    await user.type(screen.getByLabelText("Teléfono (opcional)"), "abc3000000xyz");
    await user.tab();
    await user.type(screen.getByLabelText("Email (opcional)"), "correo-invalido");
    await user.tab();
    expect(screen.getByText("Ingresa tu nombre.")).toBeVisible();
    expect(screen.getByText("Ingresa tu ciudad.")).toBeVisible();
    expect(screen.getByText("Ingresa un teléfono válido de 7 a 15 dígitos.")).toBeVisible();
    expect(screen.getByText("Ingresa un correo válido.")).toBeVisible();
  });

  it("expone límites de longitud y cantidad en los controles", () => {
    renderCalculator();
    expect(screen.getByLabelText("Cantidad")).toHaveAttribute("maxlength", "6");
    expect(screen.getByLabelText("Nombre *")).toHaveAttribute("maxlength", "80");
    expect(screen.getByLabelText("Ciudad *")).toHaveAttribute("maxlength", "80");
    expect(screen.getByLabelText("Teléfono (opcional)")).toHaveAttribute("maxlength", "20");
    expect(screen.getByLabelText("Email (opcional)")).toHaveAttribute("maxlength", "254");
    expect(screen.getByLabelText("Comentarios")).toHaveAttribute("maxlength", "500");
  });

  it("dos submits rápidos producen exactamente una intención de apertura", async () => {
    renderCalculator();
    await completeRequiredFields();
    const open = vi.spyOn(window, "open").mockReturnValue({} as Window);
    const form = screen.getByRole("region", { name: "Desglose de la solicitud" }).closest("form");
    expect(form).not.toBeNull();

    fireEvent.submit(form as HTMLFormElement);
    fireEvent.submit(form as HTMLFormElement);

    expect(open).toHaveBeenCalledTimes(1);
    expect(open.mock.calls[0]?.[0]).toMatch(/^https:\/\/wa\.me\/573001234567\?text=/);
    expect(screen.getAllByRole("button", { name: "Solicitud preparada" })).not.toHaveLength(0);
  });

  it("la UI y el mensaje interceptado usan la misma estimación completa", async () => {
    renderCalculator();
    const user = await completeRequiredFields();
    await user.click(screen.getByRole("checkbox", { name: /Diseño básico/ }));
    await user.click(screen.getByRole("checkbox", { name: /Empaque individual/ }));
    await user.clear(screen.getByLabelText("Cantidad"));
    await user.type(screen.getByLabelText("Cantidad"), "50");

    const expected = presentQuote(calculateQuote({
      product,
      quantity: 50,
      techniqueId: "sublimacion-mouse-pad",
      additionalIds: ["diseno-basico-mouse-pad", "empaque-mouse-pad"],
    }));
    const summary = screen.getByRole("region", { name: "Desglose de la solicitud" });
    expect(summary).toHaveTextContent("Total estimado");
    for (const line of expected.lines) {
      expect(summary).toHaveTextContent(line.label);
      expect(summary).toHaveTextContent(line.value.replace(/\u00a0/g, " "));
    }
    const open = vi.spyOn(window, "open").mockReturnValue({} as Window);
    fireEvent.submit(summary.closest("form") as HTMLFormElement);
    const openedUrl = new URL(String(open.mock.calls[0]?.[0]));
    const message = openedUrl.searchParams.get("text") ?? "";
    for (const line of expected.lines) expect(message).toContain(`${line.label}: ${line.value}`);
    expect(message).toContain(`${expected.totalLabel}: ${expected.totalValue}`);
  });
});

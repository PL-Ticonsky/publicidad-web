import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProductLinesSection } from "@/components/product-lines-section";
import { productLines } from "@/data/product-lines";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <div role={alt ? "img" : undefined} aria-label={alt || undefined} />,
}));

describe("ProductLinesSection", () => {
  it("conserva enlaces reales y actualiza la línea seleccionada", async () => {
    render(<ProductLinesSection lines={productLines} />);

    const canecas = screen.getByRole("link", { name: /01seleccionada canecas/i });
    const manillas = screen.getByRole("link", { name: /02seleccionar manillas/i });
    const cta = screen.getByRole("link", { name: "Cotizar esta línea →" });

    expect(canecas).toHaveAttribute("href", "/catalogo/canecas");
    expect(manillas).toHaveAttribute("href", "/catalogo/manillas");
    expect(canecas).toHaveAttribute("aria-current", "true");
    expect(cta).toHaveAttribute("href", "/catalogo/canecas");

    await userEvent.click(manillas);

    expect(manillas).toHaveAttribute("aria-current", "true");
    expect(canecas).not.toHaveAttribute("aria-current");
    expect(cta).toHaveAttribute("href", "/catalogo/manillas");
    expect(screen.getByText("Manillas", { selector: "p" })).toHaveAttribute("aria-live", "polite");
  });
});

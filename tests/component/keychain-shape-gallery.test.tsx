import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { KeychainShapeGallery } from "@/components/home/keychain-shape-gallery";

describe("KeychainShapeGallery", () => {
  it("renderiza las doce geometrías únicas del export", () => {
    const { container } = render(<KeychainShapeGallery />);
    const tiles = [...container.querySelectorAll<HTMLButtonElement>(".shape-tile")];
    const paths = tiles.map((tile) => tile.querySelector("path")?.getAttribute("d"));

    expect(tiles).toHaveLength(12);
    expect(new Set(paths).size).toBe(12);
    expect(screen.getByRole("button", { name: "Círculo" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Placa ID" })).toBeVisible();
  });

  it("filtra, selecciona y conserva la forma en el enlace al cotizador", async () => {
    const user = userEvent.setup();
    const { container } = render(<KeychainShapeGallery />);

    await user.click(screen.getByRole("button", { name: "Con función" }));
    expect(container.querySelectorAll(".shape-tile")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Destapador" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Placa ID" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Destapador" }));
    expect(screen.getByText("Forma elegida: Destapador.")).toBeVisible();
    expect(screen.getByRole("link", { name: "Cotizar esta forma →" })).toHaveAttribute(
      "href",
      "/cotizador?producto=llavero-acrilico-personalizado&forma=destapador",
    );
  });
});

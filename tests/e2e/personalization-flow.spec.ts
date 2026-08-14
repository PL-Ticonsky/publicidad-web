import { expect, test, type Page } from "@playwright/test";

declare global {
  interface Window {
    __openedPersonalizationWhatsApp: string[];
  }
}

async function interceptWhatsApp(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(window, "__openedPersonalizationWhatsApp", { value: [], writable: false });
    window.open = ((url?: string | URL) => {
      window.__openedPersonalizationWhatsApp.push(String(url));
      return window;
    }) as typeof window.open;
  });
}

test.beforeEach(async ({ context, page }) => {
  await context.route("https://wa.me/**", (route) => route.abort("blockedbyclient"));
  await interceptWhatsApp(page);
});

for (const product of [
  { slug: "llavero-metalico-redondo", name: "Llavero metálico redondo" },
  { slug: "llavero-acrilico-personalizado", name: "Llavero acrílico personalizado" },
  { slug: "llavero-destapador-corporativo", name: "Llavero destapador corporativo" },
  { slug: "mouse-pad-personalizado-rectangular", name: "Mouse Pad personalizado rectangular" },
]) {
  test(`${product.name} expone el acceso y continúa seguro sin PNG`, async ({ page }) => {
    await page.goto(`/producto/${product.slug}`);
    const customizerLink = page.getByRole("link", { name: "Abrir personalizador" });
    await expect(customizerLink).toHaveAttribute("href", `/producto/${product.slug}/personalizar`);
    await customizerLink.click();

    await expect(page).toHaveURL(`/producto/${product.slug}/personalizar`);
    await expect(page.getByRole("heading", { name: `Previsualización para ${product.name}`, level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: new RegExp(`Plantilla visual pendiente para ${product.name}`, "i") })).toBeVisible();
    await expect(page.getByText(/mockup ni área imprimible aprobados/i)).toBeVisible();

    await page.getByRole("link", { name: "Continuar al cotizador" }).click();
    await expect(page).toHaveURL(`/cotizador?producto=${product.slug}`);
    await expect(page.getByText("Archivo o referencia gráfica")).toBeVisible();

    await page.getByLabel("Nombre *").fill("María José");
    await page.getByLabel("Ciudad *").fill("Bogotá");
    await page.getByRole("region", { name: "Desglose de la solicitud" }).getByRole("button", { name: "Continuar en WhatsApp" }).dblclick();
    const opened = await page.evaluate(() => window.__openedPersonalizationWhatsApp);
    expect(opened).toHaveLength(1);
    const message = new URL(opened[0] ?? "").searchParams.get("text") ?? "";
    expect(message).not.toContain("PREVISUALIZACIÓN");
    expect(message).not.toContain("archivo PNG");
  });
}

test("un producto no compatible conserva un camino seguro al cotizador", async ({ page }) => {
  const response = await page.goto("/producto/camiseta-corporativa-personalizada/personalizar");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Este producto no admite personalización visual" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Continuar al cotizador" })).toHaveAttribute(
    "href",
    "/cotizador?producto=camiseta-corporativa-personalizada",
  );
  await expect(page.getByText(/No se añadirá ninguna referencia a un PNG/)).toBeVisible();
});

for (const viewport of [
  { width: 320, height: 700 },
  { width: 390, height: 844 },
  { width: 768, height: 1_024 },
  { width: 1_440, height: 900 },
]) {
  test(`la pantalla independiente no desborda a ${viewport.width}px`, async ({ page }) => {
    const requestsWithArtwork: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      const body = request.postData() ?? "";
      if (/data:image|png-preview|blob%3A/i.test(`${url}\n${body}`)) requestsWithArtwork.push(url);
    });
    await page.setViewportSize(viewport);
    await page.goto("/producto/mouse-pad-personalizado-rectangular/personalizar");
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasOverflow).toBe(false);
    expect(requestsWithArtwork).toEqual([]);

    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();
  });
}

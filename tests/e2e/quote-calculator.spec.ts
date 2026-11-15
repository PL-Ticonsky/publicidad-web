import { expect, test, type Page } from "@playwright/test";

declare global {
  interface Window {
    __openedWhatsApp: string[];
  }
}

const quotePath = "/cotizador?producto=llavero-metalico-redondo";
const viewports = [
  { width: 320, height: 700 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

async function interceptWhatsApp(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(window, "__openedWhatsApp", { value: [], writable: false });
    window.open = ((url?: string | URL) => {
      window.__openedWhatsApp.push(String(url));
      return window;
    }) as typeof window.open;
  });
}

test.beforeEach(async ({ context, page }) => {
  await context.route("https://wa.me/**", (route) => route.abort("blockedbyclient"));
  await interceptWhatsApp(page);
});

for (const viewport of viewports) {
  test(`muestra todo el desglose a ${viewport.width}px`, async ({ page }) => {
    const browserErrors: string[] = [];
    const responseErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400) responseErrors.push(`${response.status()} ${response.url()}`);
    });
    await page.setViewportSize(viewport);
    const response = await page.goto(quotePath);
    expect(response?.status()).toBe(200);

    const summary = page.getByRole("region", { name: "Desglose de la solicitud" });
    await expect(summary).toBeVisible();
    await expect(summary.getByText("Precio base por unidad")).toBeVisible();
    await expect(summary.getByText("Personalización")).toBeVisible();
    await expect(summary.getByText("Adicionales", { exact: true })).toBeVisible();
    await expect(summary.getByText("Subtotal estimado")).toBeVisible();
    await expect(summary.getByText(/IVA estimado/)).toBeVisible();
    await expect(summary.getByText("Total estimado", { exact: true })).toBeVisible();
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasOverflow).toBe(false);
    expect(browserErrors).toEqual([]);
    expect(responseErrors).toEqual([]);
  });
}

test("doble clic abre una sola intención, nunca navega a WhatsApp y conserva caracteres", async ({ page }) => {
  const waRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().startsWith("https://wa.me/")) waRequests.push(request.url());
  });
  await page.goto(quotePath);
  await page.getByLabel("Nombre *").fill("María José");
  await page.getByLabel("Ciudad *").fill("Bogotá");
  await page.getByLabel("Comentarios").fill("Primera línea\nSegunda línea con corazón");
  const button = page.getByRole("region", { name: "Desglose de la solicitud" }).getByRole("button", { name: "Continuar en WhatsApp" });
  await button.dblclick();

  const opened = await page.evaluate(() => window.__openedWhatsApp);
  expect(opened).toHaveLength(1);
  expect(waRequests).toEqual([]);
  const url = new URL(opened[0] ?? "");
  expect(url.origin).toBe("https://wa.me");
  expect(url.searchParams.get("text")).toContain("María José");
  expect(url.searchParams.get("text")).toContain("Bogotá");
  expect(url.searchParams.get("text")).toContain("Primera línea\nSegunda línea con corazón");
});

test("expone encabezados de seguridad sin revelar Next.js", async ({ request }) => {
  const response = await request.get(quotePath);
  expect(response.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(response.headers()["permissions-policy"]).toContain("camera=()");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["x-powered-by"]).toBeUndefined();
});

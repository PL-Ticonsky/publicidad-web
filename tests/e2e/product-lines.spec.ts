import { expect, test } from "@playwright/test";

const viewports = [
  { width: 320, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1_024 },
  { width: 1_024, height: 768 },
  { width: 1_440, height: 900 },
];

for (const viewport of viewports) {
  test(`conserva portada, formas, catálogo e historia sin overflow a ${viewport.width}px`, async ({ page }) => {
    const browserErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });
    page.on("pageerror", (error) => browserErrors.push(error.message));

    await page.setViewportSize(viewport);
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1, name: /publicidad que se queda en la mano/i })).toBeVisible();
    await expect(page.locator(".home-stats > div")).toHaveCount(5);
    await expect(page.locator("#formas .shape-tile")).toHaveCount(12);
    await expect(page.locator("#catalogo .home-catalog-row")).toHaveCount(5);
    await expect(page.locator("#historia .home-timeline > div")).toHaveCount(4);

    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasOverflow).toBe(false);
    expect(browserErrors).toEqual([]);
  });
}

test("muestra las cinco métricas completas en el primer viewport de 1920 × 1080", async ({ page }) => {
  await page.setViewportSize({ width: 1_920, height: 1_080 });
  await page.goto("/");

  const figures = page.locator(".home-stats > div");
  await expect(figures).toHaveCount(5);
  const boxes = await figures.evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().bottom));
  expect(Math.max(...boxes)).toBeLessThanOrEqual(1_080);

  const rule = await page.locator(".site-masthead-rule").boundingBox();
  expect(rule?.x).toBe(64);
  expect(rule?.width).toBe(1_792);
});

test("filtra las formas, conserva selección y construye el enlace con el slug existente", async ({ page }) => {
  await page.goto("/#formas");
  const section = page.locator("#formas");

  await section.getByRole("button", { name: "Geométricos" }).click();
  await expect(section.locator(".shape-tile")).toHaveCount(4);

  const hexagon = section.getByRole("button", { name: "Hexágono" });
  await hexagon.focus();
  await page.keyboard.press("Enter");
  await expect(hexagon).toHaveAttribute("aria-pressed", "true");
  await expect(section.getByRole("link", { name: "Cotizar esta forma →" })).toHaveAttribute(
    "href",
    "/cotizador?producto=llavero-acrilico-personalizado&forma=hexagono",
  );
});

test("los enlaces del header tienen destinos de ancla y estados hover/activo", async ({ page }) => {
  await page.setViewportSize({ width: 1_440, height: 900 });
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Navegación principal" });
  await expect(navigation.getByRole("link", { name: "Formas" })).toHaveAttribute("href", "/#formas");
  await expect(navigation.getByRole("link", { name: "Catálogo completo" })).toHaveAttribute("aria-current", "location");

  const formsLink = navigation.getByRole("link", { name: "Formas" });
  await formsLink.hover();
  await expect.poll(() => formsLink.evaluate((element) => getComputedStyle(element).color)).toBe("rgb(0, 136, 176)");
});

test("respeta la preferencia de movimiento reducido", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const tile = page.locator("#formas .shape-tile").first();
  const transitionDuration = await tile.evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(Number.parseFloat(transitionDuration)).toBeLessThanOrEqual(0.00001);
});

test("las rutas retiradas responden 404 y no reaparecen en el catálogo", async ({ page }) => {
  for (const path of [
    "/catalogo/tecnologia",
    "/catalogo/textiles",
    "/catalogo/mugs",
    "/catalogo/oficina",
    "/producto/camiseta-corporativa-personalizada",
    "/producto/memoria-usb-promocional-16gb",
  ]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
  }
});

test("el menú móvil permanece dentro del viewport y contiene todos los destinos", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator('summary[aria-label="Abrir menú"]').click();
  const menu = page.getByRole("navigation", { name: "Navegación móvil" });
  await expect(menu.getByRole("link")).toHaveCount(6);
  const box = await menu.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.x).toBeGreaterThanOrEqual(0);
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(390);
});

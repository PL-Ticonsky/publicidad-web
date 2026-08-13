import { expect, test } from "@playwright/test";

const demoUrl = "http://127.0.0.1:3102/demo/personalizador";

async function makeBrowserImage(page, mimeType) {
  const base64 = await page.evaluate(async (type) => {
    const canvas = document.createElement("canvas");
    canvas.width = 24;
    canvas.height = 12;
    const context = canvas.getContext("2d");
    context.fillStyle = "#f00000";
    context.fillRect(0, 0, 12, 12);
    context.fillStyle = "#0000f0";
    context.fillRect(12, 0, 12, 12);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, 0.92));
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }, mimeType);
  return Buffer.from(base64, "base64");
}

async function upload(page, mimeType, extension) {
  const buffer = await makeBrowserImage(page, mimeType);
  await page.getByLabel("Imagen PNG, JPEG o WebP").setInputFiles({
    name: `fixture.${extension}`,
    mimeType,
    buffer,
  });
  await expect(page.locator('div[role="status"]')).toContainText("Imagen lista para ajustar");
  await expect(page.getByText(`fixture.${extension}`, { exact: true })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const created = [];
    const revoked = [];
    const create = URL.createObjectURL.bind(URL);
    const revoke = URL.revokeObjectURL.bind(URL);
    window.__customizerUrls = { created, revoked };
    URL.createObjectURL = (blob) => {
      const url = create(blob);
      created.push(url);
      return url;
    };
    URL.revokeObjectURL = (url) => {
      revoked.push(url);
      revoke(url);
    };
  });
  await page.goto(demoUrl);
});

test("keeps production guards explicit for supported and unsupported slugs", async ({ page }) => {
  await page.getByText("Ver guardas del componente público").click();
  await expect(page.getByText(/Plantilla visual pendiente para Llavero metálico redondo/)).toBeVisible();
  await expect(page.getByText("Este producto no admite previsualización")).toBeVisible();
  await expect(page.getByText("Demo · fixture no comercial")).toBeVisible();
});

test("accepts PNG, JPEG and WebP, emits the contract and releases replaced URLs", async ({ page }) => {
  for (const [mimeType, extension] of [
    ["image/png", "png"],
    ["image/jpeg", "jpg"],
    ["image/webp", "webp"],
  ]) {
    await upload(page, mimeType, extension);
    await expect(page.getByText("800 × 600 px")).toBeVisible();
  }

  const liveUrls = await page.evaluate(() => {
    const { created, revoked } = window.__customizerUrls;
    return created.filter((url) => !revoked.includes(url)).length;
  });
  expect(liveUrls).toBe(1);

  await page.getByLabel("Slug real para probar el contrato").selectOption(
    "mouse-pad-personalizado-rectangular",
  );
  await expect(page.getByText("El callback ha emitido null.")).toBeVisible();
  const afterUnmount = await page.evaluate(() => {
    const { created, revoked } = window.__customizerUrls;
    return created.filter((url) => !revoked.includes(url)).length;
  });
  expect(afterUnmount).toBe(0);

  await upload(page, "image/png", "png");

  await page.getByRole("button", { name: "Eliminar imagen" }).click();
  await expect(page.getByText("El callback ha emitido null.")).toBeVisible();
  const remainingUrls = await page.evaluate(() => {
    const { created, revoked } = window.__customizerUrls;
    return created.filter((url) => !revoked.includes(url)).length;
  });
  expect(remainingUrls).toBe(0);
});

test("keeps processing local without storage, URL or network writes", async ({ page }) => {
  const nonGetRequests = [];
  const consoleErrors = [];
  page.on("request", (request) => {
    if (request.method() !== "GET") nonGetRequests.push(request.url());
  });
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  const before = await page.evaluate(() => ({
    local: { ...localStorage },
    session: { ...sessionStorage },
    href: location.href,
  }));

  await page.evaluate(() => {
    const decode = createImageBitmap;
    window.createImageBitmap = async (...args) => {
      await new Promise((resolve) => setTimeout(resolve, 120));
      return decode(...args);
    };
  });
  const image = await makeBrowserImage(page, "image/png");
  const selection = page.getByLabel("Imagen PNG, JPEG o WebP").setInputFiles({
    name: "local.png",
    mimeType: "image/png",
    buffer: image,
  });
  await expect(page.locator('div[role="status"]')).toContainText("Procesando la imagen");
  await selection;
  await expect(page.getByText("local.png", { exact: true })).toBeVisible();

  const after = await page.evaluate(() => ({
    local: { ...localStorage },
    session: { ...sessionStorage },
    href: location.href,
  }));
  expect(after).toEqual(before);
  expect(nonGetRequests).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test("announces invalid MIME, excessive size and decode failure without rendering them", async ({ page }) => {
  const input = page.getByLabel("Imagen PNG, JPEG o WebP");
  await input.setInputFiles({
    name: "vector.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>") ,
  });
  await expect(page.getByText(/SVG y otros formatos no están permitidos/)).toBeVisible();

  const oversized = Buffer.alloc(10 * 1024 * 1024 + 1);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(oversized);
  await input.setInputFiles({ name: "grande.png", mimeType: "image/png", buffer: oversized });
  await expect(page.getByText(/supera 10 MiB/)).toBeVisible();

  await input.setInputFiles({
    name: "corrupta.png",
    mimeType: "image/png",
    buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]),
  });
  await expect(page.getByText(/no pudo leer la imagen/)).toBeVisible();
  await expect(page.getByText("El callback ha emitido null.")).toBeVisible();
});

test("clips pixels, keeps the fixture overlay last and exports only the 800x600 canvas", async ({ page }) => {
  await upload(page, "image/png", "png");
  const pixels = await page.locator("canvas").evaluate((canvas) => {
    const context = canvas.getContext("2d");
    return {
      outside: Array.from(context.getImageData(20, 300, 1, 1).data),
      inside: Array.from(context.getImageData(400, 300, 1, 1).data),
      overlay: Array.from(context.getImageData(400, 75, 1, 1).data),
      width: canvas.width,
      height: canvas.height,
    };
  });
  expect(pixels.width).toBe(800);
  expect(pixels.height).toBe(600);
  expect(pixels.outside.slice(0, 3)).toEqual([233, 232, 228]);
  expect(pixels.inside[1]).toBeLessThan(20);
  expect(Math.max(pixels.inside[0], pixels.inside[2])).toBeGreaterThan(80);
  expect(pixels.overlay[0]).toBeLessThan(100);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar PNG" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("fixture-previsualizacion.png");
});

test("supports sliders, reset, mouse, keyboard and a basic touch drag", async ({ page, context }) => {
  await upload(page, "image/png", "png");
  const canvas = page.locator("canvas");
  const initial = await canvas.evaluate((element) => element.toDataURL());

  await page.getByLabel("Zoom").fill("175");
  await page.getByLabel("Rotación").fill("45");
  await expect(page.locator("output").filter({ hasText: "175%" })).toBeVisible();
  await expect(page.locator("output").filter({ hasText: "45°" })).toBeVisible();
  await page.getByRole("button", { name: "Centrar y restablecer imagen" }).click();
  await expect(page.locator("output").filter({ hasText: "100%" })).toBeVisible();
  await expect(page.locator("output").filter({ hasText: "0°" })).toBeVisible();

  await canvas.focus();
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => canvas.evaluate((element) => element.toDataURL())).not.toBe(initial);
  await page.getByRole("button", { name: "Centrar y restablecer imagen" }).click();

  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 35, box.y + box.height / 2 + 15);
  await page.mouse.up();
  const afterMouse = await canvas.evaluate((element) => element.toDataURL());

  const cdp = await context.newCDPSession(page);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y, id: 1 }],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: x - 30, y: y + 20, id: 1 }],
  });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect.poll(() => canvas.evaluate((element) => element.toDataURL())).not.toBe(afterMouse);
});

test("fits 320, 390, 768 and desktop without horizontal overflow", async ({ page }) => {
  for (const viewport of [
    { width: 320, height: 720 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    await page.setViewportSize(viewport);
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth);
    await expect(page.getByLabel("Imagen PNG, JPEG o WebP")).toBeVisible();
  }
});

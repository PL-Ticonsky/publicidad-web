import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "line",
  use: {
    baseURL: "http://127.0.0.1:3041",
    browserName: "chromium",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 -p 3041",
    url: "http://127.0.0.1:3041",
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_WHATSAPP_NUMBER: "573001234567",
    },
  },
});

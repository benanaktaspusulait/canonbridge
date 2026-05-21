import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: {
    timeout: 8_000,
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  webServer: {
    command:
      "CANONBRIDGE_COMPONENT_GALLERY_ENABLED=true NEXT_PUBLIC_LEAD_CAPTURE_ENABLED=true LEAD_WEBHOOK_URL=memory://accept npm run build && CANONBRIDGE_COMPONENT_GALLERY_ENABLED=true NEXT_PUBLIC_LEAD_CAPTURE_ENABLED=true LEAD_WEBHOOK_URL=memory://accept npm run start -- -p 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
  ],
});

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
      "CANONBRIDGE_COMPONENT_GALLERY_ENABLED=true NEXT_PUBLIC_LEAD_CAPTURE_ENABLED=true LEAD_WEBHOOK_URL=memory://accept npm run build && rm -rf .next/standalone/public .next/standalone/.next/static && mkdir -p .next/standalone/.next && cp -R public .next/standalone/public && cp -R .next/static .next/standalone/.next/static && CANONBRIDGE_COMPONENT_GALLERY_ENABLED=true NEXT_PUBLIC_LEAD_CAPTURE_ENABLED=true LEAD_WEBHOOK_URL=memory://accept PORT=4173 HOSTNAME=127.0.0.1 node .next/standalone/server.js",
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

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("homepage renders, submits lead webhook, and has no axe violations", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Any Source\. One Format\./i })).toBeVisible();
  await expect(page.getByRole("navigation")).toBeVisible();
  await page.waitForTimeout(500);

  const accessibilityScanResults = await new AxeBuilder({ page })
    .include("main")
    .analyze();
  expect(accessibilityScanResults.violations).toEqual([]);

  await page.locator("#demo").scrollIntoViewIfNeeded();
  const form = page.locator("#demo form");
  await page.waitForTimeout(1600);
  await form.getByLabel("Name").fill("Ada Lovelace");
  await form.getByLabel("Company").fill("Analytical Engines");
  await form.getByLabel("Work Email").fill("ada@example.com");
  await form.getByLabel(/How many partner integrations/i).selectOption("20–50 partners");
  await form.getByLabel(/Tell us about/i).fill("Need canonical event mappings across payment and logistics partners.");
  await expect(form.getByLabel("Work Email")).toHaveValue("ada@example.com");
  await form.evaluate((node) => {
    (node as HTMLFormElement).dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true }),
    );
  });

  await expect(page.getByText("Demo request sent. We will get back to you within 24 hours.")).toBeVisible();
});

test("localized route renders Turkish SSR content", async ({ page }) => {
  await page.goto("/tr");

  await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  await expect(page).toHaveURL(/\/tr/);
  await expect(page.getByRole("link", { name: /Demo Talep Et/i }).first()).toBeVisible();
});

test("localized route renders German SSR content", async ({ page }) => {
  await page.goto("/de");

  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await expect(page).toHaveURL(/\/de/);
  await expect(page.getByRole("link", { name: /Demo anfordern/i }).first()).toBeVisible();
});

test("localized route renders Spanish SSR content", async ({ page }) => {
  await page.goto("/es");

  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page).toHaveURL(/\/es/);
  await expect(page.getByRole("link", { name: /Solicitar Demo/i }).first()).toBeVisible();
});

test("navbar accessibility: aria-expanded, role=menu", async ({ page }) => {
  await page.goto("/");

  // Desktop language menu
  const langButton = page.locator("button[aria-haspopup='menu']");
  await expect(langButton).toHaveAttribute("aria-expanded", "false");
  await langButton.click();
  await expect(langButton).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("[role='menu']")).toBeVisible();

  // Full page axe scan including navbar
  const accessibilityScanResults = await new AxeBuilder({ page })
    .include("nav")
    .analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
});

test("mobile navigation toggle works", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");

  const menuButton = page.locator("button[aria-label='Toggle navigation']");
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await menuButton.click();
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#mobile-navigation")).toBeVisible();
});

test("component gallery is available", async ({ page }) => {
  await page.goto("/component-gallery");

  await expect(page.getByRole("heading", { name: "Component Gallery" })).toBeVisible();
  await expect(page.getByText("Icons use lucide-react.")).toBeVisible();
});

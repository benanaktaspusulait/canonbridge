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

  await page.getByLabel("Name").fill("Ada Lovelace");
  await page.getByLabel("Company").fill("Analytical Engines");
  await page.getByLabel("Work Email").fill("ada@example.com");
  await page.getByLabel(/How many partner integrations/i).selectOption("20–50 partners");
  await page.getByLabel(/Tell us about/i).fill("Need canonical event mappings across payment and logistics partners.");
  await page.getByRole("button", { name: "Request a Demo" }).click();

  await expect(page.getByText("Demo request sent. We will get back to you within 24 hours.")).toBeVisible();
});

test("language switch updates the document language", async ({ page }) => {
  await page.goto("/");

  if ((page.viewportSize()?.width ?? 0) < 768) {
    await page.getByRole("button", { name: "Toggle navigation" }).click();
    await page.getByRole("button", { name: "TR", exact: true }).click();
  } else {
    await page.getByRole("button", { name: /🇬🇧 EN/i }).click();
    await page.getByRole("menuitem", { name: /Türkçe/i }).click();
  }

  await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  await expect(page.getByRole("link", { name: /Demo Talep Et/i }).first()).toBeVisible();
});

test("component gallery is available", async ({ page }) => {
  await page.goto("/component-gallery");

  await expect(page.getByRole("heading", { name: "Component Gallery" })).toBeVisible();
  await expect(page.getByText("Icons use lucide-react.")).toBeVisible();
});

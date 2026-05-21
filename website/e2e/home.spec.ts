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

test("component gallery is available", async ({ page }) => {
  await page.goto("/component-gallery");

  await expect(page.getByRole("heading", { name: "Component Gallery" })).toBeVisible();
  await expect(page.getByText("Icons use lucide-react.")).toBeVisible();
});

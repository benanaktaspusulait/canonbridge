#!/usr/bin/env node
/**
 * Captures a screenshot of the Mapping Studio UI for the website hero section.
 * 
 * Usage:
 *   MAPPING_STUDIO_URL=http://localhost:4200 node scripts/capture-hero-screenshot.mjs
 * 
 * Outputs:
 *   public/images/canonbridge-mapping-studio.png (1440x900)
 *   public/images/canonbridge-mapping-studio-960.webp
 *   public/images/canonbridge-mapping-studio-1440.webp
 *   public/images/canonbridge-mapping-studio-960.avif
 *   public/images/canonbridge-mapping-studio-1440.avif
 * 
 * Requires: playwright (npx playwright install chromium)
 */

import { chromium } from "playwright";
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const STUDIO_URL = process.env.MAPPING_STUDIO_URL || "http://localhost:4200";
const OUTPUT_DIR = path.resolve(import.meta.dirname, "../public/images");

async function main() {
  console.log(`Capturing Mapping Studio screenshot from ${STUDIO_URL}...`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await page.goto(STUDIO_URL, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000); // Let animations settle

    const pngPath = path.join(OUTPUT_DIR, "canonbridge-mapping-studio.png");
    await page.screenshot({ path: pngPath, fullPage: false });
    console.log(`  ✓ PNG saved: ${pngPath}`);

    // Generate WebP and AVIF variants using sharp (if available) or cwebp/avifenc
    if (hasSharp()) {
      const sharp = (await import("sharp")).default;
      const img = sharp(pngPath);

      await img.clone().resize(960).webp({ quality: 85 }).toFile(path.join(OUTPUT_DIR, "canonbridge-mapping-studio-960.webp"));
      await img.clone().resize(1440).webp({ quality: 85 }).toFile(path.join(OUTPUT_DIR, "canonbridge-mapping-studio-1440.webp"));
      await img.clone().resize(960).avif({ quality: 70 }).toFile(path.join(OUTPUT_DIR, "canonbridge-mapping-studio-960.avif"));
      await img.clone().resize(1440).avif({ quality: 70 }).toFile(path.join(OUTPUT_DIR, "canonbridge-mapping-studio-1440.avif"));
      console.log("  ✓ WebP and AVIF variants generated");
    } else {
      console.log("  ⚠ sharp not available — skipping WebP/AVIF generation");
      console.log("    Install with: npm install sharp --save-dev");
    }
  } catch (err) {
    console.error("Failed to capture screenshot:", err.message);
    console.error("Make sure the Mapping Studio UI is running at", STUDIO_URL);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

function hasSharp() {
  try {
    execSync("node -e \"require('sharp')\"", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

main();

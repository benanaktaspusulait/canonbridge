import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = new URL("..", import.meta.url).pathname;

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function allFiles(dir) {
  return readdirSync(join(root, dir)).flatMap((entry) => {
    const path = join(dir, entry);
    const absolute = join(root, path);
    return statSync(absolute).isDirectory() ? allFiles(path) : [path];
  });
}

test("marketing site has SEO metadata and structured data", () => {
  const layout = read("app/layout.tsx");
  const page = read("app/page.tsx");

  assert.match(layout, /openGraph/);
  assert.match(layout, /twitter/);
  assert.match(layout, /alternates/);
  assert.match(layout, /canonbridge-og\.png/);
  assert.doesNotMatch(layout, /canonbridge-og\.svg/);
  assert.doesNotMatch(layout, /next\/font\/google/);
  assert.match(page, /application\/ld\+json/);
  assert.match(page, /Organization/);
  assert.match(page, /BreadcrumbList/);
});

test("hero uses the real Mapping Studio product screenshot", () => {
  const hero = read("components/Hero.tsx");

  assert.match(hero, /canonbridge-mapping-studio\.png/);
  assert.match(hero, /canonbridge-mapping-studio-1440\.avif/);
  assert.match(hero, /canonbridge-mapping-studio-1440\.webp/);
  assert.doesNotMatch(hero, /canonbridge-console\.svg/);
  assert.doesNotThrow(() => statSync(join(root, "public/images/canonbridge-mapping-studio.png")));
});

test("mobile navigation and contact form are not no-op placeholders", () => {
  const navbar = read("components/Navbar.tsx");
  const footer = read("components/Footer.tsx");

  assert.match(navbar, /mobileOpen/);
  assert.match(navbar, /aria-controls="mobile-navigation"/);
  assert.match(navbar, /lucide-react/);
  assert.match(footer, /NEXT_PUBLIC_LEAD_WEBHOOK_URL/);
  assert.match(footer, /honeypot/);
  assert.match(footer, /elapsedMs/);
  assert.match(footer, /mailto:sales@canonbridge\.io/);
  assert.doesNotMatch(footer, /Form submission logic/);
});

test("internal component gallery is excluded from search indexing", () => {
  const robots = read("app/robots.ts");
  const sitemap = read("app/sitemap.ts");
  const galleryLayout = read("app/component-gallery/layout.tsx");

  assert.match(robots, /component-gallery/);
  assert.doesNotMatch(sitemap, /component-gallery/);
  assert.match(galleryLayout, /index: false/);
});

test("brand token snapshots are generated from shared tokens", () => {
  const websiteTokens = read("app/brand-tokens.css");

  assert.match(websiteTokens, /Generated from packages\/tokens\/src\/index\.css/);
  assert.match(websiteTokens, /oklch/);
});

test("legacy Tailwind config is not present for the v4 theme", () => {
  assert.throws(() => statSync(join(root, "tailwind.config.ts")));
});

test("component gallery documents shared UI primitives", () => {
  const gallery = read("app/component-gallery/page.tsx");

  assert.match(gallery, /Component Gallery/);
  assert.match(gallery, /lucide-react/);
  assert.match(gallery, /--cb-color-brand-600/);
});

test("static assets referenced by the app exist", () => {
  const files = allFiles("app")
    .concat(allFiles("components"))
    .map(read)
    .join("\n");
  const assetRefs = [...files.matchAll(/\/(?:images|videos)\/[^\s"',`)]+/g)].map((m) => m[0]);

  for (const ref of assetRefs) {
    const diskPath = join(root, "public", ref.replace(/^\//, ""));
    assert.doesNotThrow(() => statSync(diskPath), `${ref} should exist in public/`);
  }
});

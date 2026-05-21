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
  assert.match(page, /application\/ld\+json/);
});

test("mobile navigation and contact form are not no-op placeholders", () => {
  const navbar = read("components/Navbar.tsx");
  const footer = read("components/Footer.tsx");

  assert.match(navbar, /mobileOpen/);
  assert.match(navbar, /aria-controls="mobile-navigation"/);
  assert.match(footer, /mailto:sales@canonbridge\.io/);
  assert.doesNotMatch(footer, /Form submission logic/);
});

test("static assets referenced by the app exist", () => {
  const files = allFiles("app")
    .concat(allFiles("components"))
    .map(read)
    .join("\n");
  const assetRefs = [...files.matchAll(/["'](\/(?:images|videos)\/[^"']+)["']/g)].map((m) => m[1]);

  for (const ref of assetRefs) {
    const diskPath = join(root, "public", ref.replace(/^\//, ""));
    assert.doesNotThrow(() => statSync(diskPath), `${ref} should exist in public/`);
  }
});

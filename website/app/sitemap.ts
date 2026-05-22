import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://canonbridge.io";
const locales = ["", "/tr", "/de", "/es"];

// W-V8-M4 FIX: Include all routes × locales in sitemap
const pages = [
  { path: "", priority: 1, changeFrequency: "weekly" as const },
  { path: "/pricing", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/terms", priority: 0.3, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.3, changeFrequency: "monthly" as const },
  { path: "/dpa", priority: 0.2, changeFrequency: "monthly" as const },
  { path: "/subprocessors", priority: 0.2, changeFrequency: "monthly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    // Root locale (English)
    entries.push({
      url: `${siteUrl}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    });

    // Other locales (only for main marketing pages)
    if (page.path === "" || page.path === "/pricing") {
      for (const locale of locales) {
        if (locale) {
          entries.push({
            url: `${siteUrl}${locale}${page.path}`,
            lastModified: new Date(),
            changeFrequency: page.changeFrequency,
            priority: page.priority * 0.9,
          });
        }
      }
    }
  }

  return entries;
}

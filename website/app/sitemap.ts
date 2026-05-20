import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://canonbridge.io";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-05-21");

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}

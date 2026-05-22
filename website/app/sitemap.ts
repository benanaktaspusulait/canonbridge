import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://canonbridge.io";
const localePaths = ["", "/tr", "/de", "/es"];

export default function sitemap(): MetadataRoute.Sitemap {
  return localePaths.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path ? 0.9 : 1,
  }));
}

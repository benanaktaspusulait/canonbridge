import SitePage from "@/components/SitePage";
import type { Metadata } from "next";

const routedLocales = ["tr", "de", "es"] as const;
type RoutedLocale = (typeof routedLocales)[number];

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://canonbridge.io";

export const dynamicParams = false;

export function generateStaticParams() {
  return routedLocales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const localeLabels: Record<RoutedLocale, string> = {
    tr: "Türkçe",
    de: "Deutsch",
    es: "Español",
  };
  const label = localeLabels[locale as RoutedLocale] ?? locale;

  return {
    title: `CanonBridge | Enterprise Integration Platform (${label})`,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        "x-default": "/",
        en: "/",
        tr: "/tr",
        de: "/de",
        es: "/es",
      },
    },
    openGraph: {
      url: `${siteUrl}/${locale}`,
      locale: locale === "tr" ? "tr_TR" : locale === "de" ? "de_DE" : locale === "es" ? "es_ES" : "en_US",
    },
  };
}

export default function LocalePage() {
  return <SitePage />;
}

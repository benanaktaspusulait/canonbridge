import type { Metadata } from "next";
import { headers } from "next/headers";
import localFont from "next/font/local";
import "./globals.css";
import { LocaleProvider } from "@/lib/LocaleContext";
import MotionProvider from "@/lib/MotionProvider";
import type { Locale } from "@/lib/i18n";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://canonbridge.io";
const supportedLocales: Locale[] = ["en", "tr", "de", "es"];
const ogImage = "/images/canonbridge-og.png?v=2026-05-21";

const canonSans = localFont({
  src: "./fonts/canon-sans.woff2",
  variable: "--cb-font-sans",
  display: "swap",
});

const canonMono = localFont({
  src: "./fonts/canon-mono.woff2",
  variable: "--cb-font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CanonBridge | Enterprise Integration Platform",
    template: "%s | CanonBridge",
  },
  description:
    "Transform partner data with zero code. Visual mapping, real-time transformation, and operational recovery for enterprise integrations.",
  applicationName: "CanonBridge",
  authors: [{ name: "CanonBridge" }],
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      tr: "/tr",
      de: "/de",
      es: "/es",
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "CanonBridge",
    title: "CanonBridge | Enterprise Integration Platform",
    description:
      "A no-code integration control plane for mapping partner payloads into canonical business events.",
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: "CanonBridge integration workflow console",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CanonBridge | Enterprise Integration Platform",
    description:
      "Visual mapping, runtime recovery, and observability for partner integrations.",
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

function normalizeLocale(locale?: string): Locale {
  return supportedLocales.includes(locale as Locale) ? (locale as Locale) : "en";
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params?: Promise<{ locale?: string }>;
}>) {
  const resolvedParams = params ? await params : {};
  const requestHeaders = await headers();
  const locale = normalizeLocale(
    resolvedParams.locale ?? requestHeaders.get("x-canonbridge-locale") ?? undefined,
  );

  return (
    <html lang={locale}>
      <body className={`${canonSans.variable} ${canonMono.variable} antialiased`}>
        <MotionProvider>
          <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
        </MotionProvider>
      </body>
    </html>
  );
}

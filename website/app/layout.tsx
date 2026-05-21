import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/lib/LocaleContext";
import MotionProvider from "@/lib/MotionProvider";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  variable: "--font-manrope",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://canonbridge.io";

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
        url: "/images/canonbridge-og.png",
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
    images: ["/images/canonbridge-og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} antialiased`}>
        <MotionProvider>
          <LocaleProvider>{children}</LocaleProvider>
        </MotionProvider>
      </body>
    </html>
  );
}

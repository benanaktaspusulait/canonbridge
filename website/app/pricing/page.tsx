import type { Metadata } from "next";
import PricingPage from "@/components/pricing/PricingPage";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://canonbridge.io";

export const metadata: Metadata = {
  title: "Pricing | CanonBridge — Integration Platform",
  description:
    "Transparent pricing for every stage. Start free, scale as you grow. No surprises, no hidden fees.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "CanonBridge Pricing",
    description: "Start free. Scale as you grow. Enterprise-ready when you need it.",
    url: `${siteUrl}/pricing`,
    type: "website",
  },
};

export default function Pricing() {
  return <PricingPage />;
}

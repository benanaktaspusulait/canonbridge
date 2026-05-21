import SitePage from "@/components/SitePage";

const routedLocales = ["tr", "de", "es"] as const;

export const dynamicParams = false;

export function generateStaticParams() {
  return routedLocales.map((locale) => ({ locale }));
}

export default function LocalePage() {
  return <SitePage />;
}

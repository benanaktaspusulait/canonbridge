import SiteContent from "@/components/SiteContent";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://canonbridge.io";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "CanonBridge",
      url: siteUrl,
      logo: `${siteUrl}/images/logo-canonbridge.svg`,
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: "CanonBridge",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "Enterprise integration platform for visually mapping partner payloads into canonical business events.",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/PreOrder",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What systems can CanonBridge connect?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "CanonBridge connects queues, webhooks, REST APIs, SOAP/XML services, SFTP, cloud storage, databases, EDI, file drops, and scheduled polling sources.",
          },
        },
        {
          "@type": "Question",
          name: "Does CanonBridge require custom integration code?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "CanonBridge provides visual field mapping, validation, publishing, and runtime recovery so teams can onboard partner data without writing custom transformation code.",
          },
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "CanonBridge",
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: ["en", "tr", "de", "es"],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${siteUrl}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteUrl,
        },
      ],
    },
  ],
};

/**
 * Server Component wrapper for the marketing site.
 * 
 * - JSON-LD structured data is rendered server-side (no client JS cost)
 * - Interactive content is code-split via SiteContent (client component)
 * - Below-the-fold sections are dynamically imported for better LCP/TBT
 */
export default function SitePage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SiteContent />
    </main>
  );
}

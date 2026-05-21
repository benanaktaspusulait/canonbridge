"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import VideoSection from "@/components/VideoSection";
import Metrics from "@/components/Metrics";
import Scalability from "@/components/Scalability";
import Architecture from "@/components/Architecture";
import Features from "@/components/Features";
import UseCases from "@/components/UseCases";
import Footer from "@/components/Footer";
import { useLocale } from "@/lib/LocaleContext";

export default function Home() {
  const { t } = useLocale();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CanonBridge",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Enterprise integration platform for visually mapping partner payloads into canonical business events.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/PreOrder",
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />
      <Hero />

      <div className="section-divider" />

      <section id="how-it-works" className="bg-white pt-24 pb-8" aria-labelledby="how-it-works-title">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 id="how-it-works-title" className="hero-title text-3xl md:text-4xl font-bold mb-4 text-navy-900">
            {t.howItWorks.title}{" "}
            <span className="gradient-text">{t.howItWorks.titleHighlight}</span>
          </h2>
          <p className="text-navy-700 text-lg">{t.howItWorks.subtitle}</p>
        </div>
      </section>

      <VideoSection
        id="sources"
        step={1}
        subtitle={t.steps.step1.subtitle}
        title={t.steps.step1.title}
        description={t.steps.step1.description}
        bullets={t.steps.step1.bullets}
      />

      <div className="section-divider" />

      <VideoSection
        step={2}
        subtitle={t.steps.step2.subtitle}
        title={t.steps.step2.title}
        description={t.steps.step2.description}
        bullets={t.steps.step2.bullets}
        reversed
      />

      <div className="section-divider" />

      <VideoSection
        step={3}
        subtitle={t.steps.step3.subtitle}
        title={t.steps.step3.title}
        description={t.steps.step3.description}
        bullets={t.steps.step3.bullets}
      />

      <div className="section-divider" />

      <VideoSection
        step={4}
        subtitle={t.steps.step4.subtitle}
        title={t.steps.step4.title}
        description={t.steps.step4.description}
        bullets={t.steps.step4.bullets}
        reversed
      />

      <div className="section-divider" />

      <VideoSection
        step={5}
        subtitle={t.steps.step5.subtitle}
        title={t.steps.step5.title}
        description={t.steps.step5.description}
        bullets={t.steps.step5.bullets}
      />

      <div className="section-divider" />

      <Metrics />

      <div className="section-divider" />

      <Scalability />

      <div className="section-divider" />

      <Architecture />

      <div className="section-divider" />

      <Features />

      <div className="section-divider" />

      <UseCases />

      <div className="section-divider" />

      <Footer />
    </main>
  );
}

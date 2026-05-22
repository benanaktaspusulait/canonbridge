"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { useLocale } from "@/lib/LocaleContext";

// Lazy-load below-the-fold sections for better LCP/TBT
const VideoSection = dynamic(() => import("@/components/VideoSection"), { ssr: true });
const Metrics = dynamic(() => import("@/components/Metrics"), { ssr: true });
const Scalability = dynamic(() => import("@/components/Scalability"), { ssr: true });
const Architecture = dynamic(() => import("@/components/Architecture"), { ssr: true });
const Features = dynamic(() => import("@/components/Features"), { ssr: true });
const UseCases = dynamic(() => import("@/components/UseCases"), { ssr: true });

export default function SiteContent() {
  const { t } = useLocale();

  return (
    <>
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
    </>
  );
}

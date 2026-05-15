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

  return (
    <main>
      <Navbar />
      <Hero />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* How It Works heading */}
      <section id="how-it-works" className="pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.howItWorks.title}{" "}
            <span className="gradient-text">{t.howItWorks.titleHighlight}</span>
          </h2>
          <p className="text-gray-400 text-lg">{t.howItWorks.subtitle}</p>
        </div>
      </section>

      <VideoSection
        id="sources"
        step={1}
        subtitle={t.steps.step1.subtitle}
        title={t.steps.step1.title}
        description={t.steps.step1.description}
        bullets={t.steps.step1.bullets}
        videoSrc="/videos/onboard-source.mp4"
      />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <VideoSection
        step={2}
        subtitle={t.steps.step2.subtitle}
        title={t.steps.step2.title}
        description={t.steps.step2.description}
        bullets={t.steps.step2.bullets}
        videoSrc="/videos/field-mapping.mp4"
        reversed
      />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <VideoSection
        step={3}
        subtitle={t.steps.step3.subtitle}
        title={t.steps.step3.title}
        description={t.steps.step3.description}
        bullets={t.steps.step3.bullets}
        videoSrc="/videos/test-validate.mp4"
      />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <VideoSection
        step={4}
        subtitle={t.steps.step4.subtitle}
        title={t.steps.step4.title}
        description={t.steps.step4.description}
        bullets={t.steps.step4.bullets}
        videoSrc="/videos/publish.mp4"
        reversed
      />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <VideoSection
        step={5}
        subtitle={t.steps.step5.subtitle}
        title={t.steps.step5.title}
        description={t.steps.step5.description}
        bullets={t.steps.step5.bullets}
        videoSrc="/videos/monitor.mp4"
      />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <Metrics />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <Scalability />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <Architecture />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <Features />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <UseCases />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <Footer />
    </main>
  );
}

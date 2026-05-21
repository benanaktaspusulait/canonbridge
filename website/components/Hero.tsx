"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";

export default function Hero() {
  const { t } = useLocale();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20 pb-16">
      <div className="absolute inset-0 gradient-bg" />

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(6,16,22,0.3) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(6,16,22,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]"
        >
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-navy-900/10 bg-white/72 backdrop-blur-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-accent-blue" />
              <span className="text-sm font-medium text-navy-700">{t.hero.badge}</span>
            </div>

            <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6 text-navy-900 text-balance">
              {t.hero.title1}
              <br />
              <span className="gradient-text">{t.hero.title2}</span>
            </h1>

            <p className="text-lg md:text-xl text-navy-700 max-w-2xl mb-10 leading-relaxed">
              {t.hero.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-12">
              {t.hero.sources.map((source) => (
                <span
                  key={source}
                  className="px-3 py-1.5 text-xs font-semibold text-navy-700 bg-white/80 border border-navy-900/10 rounded-full"
                >
                  {source}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <motion.a
                href="#how-it-works"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-accent-blue text-white font-semibold rounded-xl shadow-lg shadow-accent-blue/20 hover:bg-navy-900 transition-colors"
              >
                {t.hero.cta1}
              </motion.a>
              <motion.a
                href="#demo"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 border border-navy-900/15 text-navy-800 font-semibold rounded-xl hover:bg-white transition-all"
              >
                {t.hero.cta2}
              </motion.a>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="relative"
          >
            <Image
              src="/images/canonbridge-console.svg"
              alt="CanonBridge Mapping Studio showing partner sources, field mapping, validation, and runtime health"
              width={1120}
              height={700}
              className="w-full rounded-xl border border-navy-900/10 bg-white shadow-2xl"
              priority
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 text-navy-700 md:block"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-navy-700"
          >
            <path
              d="M12 5v14M5 12l7 7 7-7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}

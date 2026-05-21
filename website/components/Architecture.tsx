"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";

export default function Architecture() {
  const { t } = useLocale();

  return (
    <section id="architecture" className="relative overflow-hidden bg-[var(--cb-color-cloud-50)] py-24 md:py-32" aria-labelledby="architecture-title">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 id="architecture-title" className="hero-title text-3xl md:text-4xl font-bold mb-4 text-navy-900">
            {t.architecture.title}
          </h2>
          <p className="text-navy-700 text-lg max-w-2xl mx-auto">
            {t.architecture.subtitle}
          </p>
        </motion.div>

        {/* Architecture diagram */}
        <motion.div
          className="relative overflow-hidden rounded-xl border border-navy-900/10 bg-white p-8 shadow-sm md:p-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="flex flex-col gap-6">
            {/* Row 1: Sources */}
            <div className="flex flex-wrap justify-center gap-3">
              {t.architecture.sources.map((src, i) => (
                <motion.div
                  key={src}
                  className="rounded-lg border border-accent-purple/20 bg-accent-purple/10 px-4 py-2 text-sm font-medium text-accent-purple"
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  {src}
                </motion.div>
              ))}
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <svg className="w-6 h-8 text-navy-700/35" fill="none" viewBox="0 0 24 32">
                <path d="M12 0v28M6 22l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Row 2: Ingress */}
            <div className="flex justify-center">
              <div className="px-6 py-3 rounded-xl bg-navy-900 border border-navy-900/10 text-center">
                <div className="text-white font-semibold">{t.architecture.ingress}</div>
                <div className="text-white/65 text-xs mt-1">{t.architecture.ingressDesc}</div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <svg className="w-6 h-8 text-navy-700/35" fill="none" viewBox="0 0 24 32">
                <path d="M12 0v28M6 22l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Row 3: Raw Events */}
            <div className="flex justify-center">
              <div className="px-6 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center">
                <div className="text-orange-400 font-semibold">{t.architecture.rawEvents}</div>
                <div className="text-navy-700/65 text-xs mt-1">{t.architecture.rawEventsDesc}</div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <svg className="w-6 h-8 text-navy-700/35" fill="none" viewBox="0 0 24 32">
                <path d="M12 0v28M6 22l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Row 4: Transformer */}
            <div className="flex justify-center">
              <div className="px-8 py-4 rounded-xl bg-accent-blue/10 border border-accent-blue/20 text-center glow-blue">
                <div className="text-accent-blue font-bold text-lg">{t.architecture.transformer}</div>
                <div className="text-navy-700 text-xs mt-2 flex flex-wrap justify-center gap-2">
                  {t.architecture.transformerTags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-white/70 rounded">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <svg className="w-6 h-8 text-navy-700/35" fill="none" viewBox="0 0 24 32">
                <path d="M12 0v28M6 22l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Row 5: Canonical Events */}
            <div className="flex justify-center">
              <div className="px-6 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="text-emerald-400 font-semibold">{t.architecture.canonicalEvents}</div>
                <div className="text-navy-700/65 text-xs mt-1">{t.architecture.canonicalEventsDesc}</div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <svg className="w-6 h-8 text-navy-700/35" fill="none" viewBox="0 0 24 32">
                <path d="M12 0v28M6 22l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Row 6: Business Service */}
            <div className="flex justify-center">
              <div className="px-8 py-4 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 text-center glow-cyan">
                <div className="text-accent-cyan font-bold text-lg">{t.architecture.businessService}</div>
                <div className="text-navy-700 text-xs mt-2 flex flex-wrap justify-center gap-2">
                  {t.architecture.businessTags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-white/70 rounded">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <svg className="w-6 h-8 text-navy-700/35" fill="none" viewBox="0 0 24 32">
                <path d="M12 0v28M6 22l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Row 7: Outputs */}
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-4 py-2 rounded-lg bg-[var(--cb-color-cloud-50)] border border-navy-900/10 text-navy-700 text-sm">
                {t.architecture.database}
              </div>
              <div className="px-4 py-2 rounded-lg bg-[var(--cb-color-cloud-50)] border border-navy-900/10 text-navy-700 text-sm">
                {t.architecture.businessEvents}
              </div>
              <div className="px-4 py-2 rounded-lg bg-[var(--cb-color-cloud-50)] border border-navy-900/10 text-navy-700 text-sm">
                {t.architecture.downstream}
              </div>
            </div>
          </div>

          {/* Side labels */}
          <div className="absolute top-8 right-8 hidden lg:block">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-navy-700/65">
                <span className="w-3 h-3 rounded-full bg-accent-purple/30" />
                {t.architecture.legendSources}
              </div>
              <div className="flex items-center gap-2 text-xs text-navy-700/65">
                <span className="w-3 h-3 rounded-full bg-orange-500/30" />
                {t.architecture.legendRaw}
              </div>
              <div className="flex items-center gap-2 text-xs text-navy-700/65">
                <span className="w-3 h-3 rounded-full bg-accent-blue/30" />
                {t.architecture.legendTransformation}
              </div>
              <div className="flex items-center gap-2 text-xs text-navy-700/65">
                <span className="w-3 h-3 rounded-full bg-emerald-500/30" />
                {t.architecture.legendCanonical}
              </div>
              <div className="flex items-center gap-2 text-xs text-navy-700/65">
                <span className="w-3 h-3 rounded-full bg-accent-cyan/30" />
                {t.architecture.legendBusiness}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

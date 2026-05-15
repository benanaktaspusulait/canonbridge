"use client";

import { motion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";

export default function Scalability() {
  const { t } = useLocale();

  const tiers = [
    { events: "1K", unit: "events/sec", ...t.scalability.tiers[0] },
    { events: "10K", unit: "events/sec", ...t.scalability.tiers[1] },
    { events: "100K", unit: "events/sec", ...t.scalability.tiers[2] },
    { events: "1M+", unit: "events/sec", ...t.scalability.tiers[3] },
  ];

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-full h-[500px] -translate-y-1/2 bg-gradient-to-r from-accent-blue/5 via-accent-cyan/5 to-accent-purple/5 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.scalability.title}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t.scalability.subtitle}
          </p>
        </motion.div>

        {/* Scale tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.label}
              className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-accent-blue/20 transition-all group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <div className="text-xs text-accent-cyan font-semibold uppercase tracking-wider mb-3">
                {tier.label}
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                {tier.events}
              </div>
              <div className="text-sm text-gray-500 mb-3">{tier.unit}</div>
              <div className="text-sm text-gray-300 font-medium mb-1">
                {tier.partners}
              </div>
              <div className="text-xs text-gray-500">{tier.desc}</div>

              {/* Progress bar */}
              <div className="mt-4 h-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-accent-blue to-accent-cyan"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${25 + i * 25}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* How it scales */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="w-10 h-10 rounded-lg bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">{t.scalability.horizontal}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t.scalability.horizontalDesc}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">{t.scalability.autoScaling}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t.scalability.autoScalingDesc}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="w-10 h-10 rounded-lg bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-accent-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">{t.scalability.isolation}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {t.scalability.isolationDesc}
            </p>
          </div>
        </motion.div>

        {/* Bottom message */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            {t.scalability.bottom}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import {
  Activity,
  ClipboardCheck,
  FileLock2,
  GitBranch,
  KeyRound,
  LockKeyhole,
  Network,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";

const featureIcons = [
  Network,
  LockKeyhole,
  RefreshCcw,
  FileLock2,
  GitBranch,
  Activity,
  ShieldCheck,
  ClipboardCheck,
  KeyRound,
];

export default function Features() {
  const { t } = useLocale();

  return (
    <section id="features" className="relative bg-[var(--cb-color-cloud-50)] py-24 md:py-32" aria-labelledby="features-title">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 id="features-title" className="hero-title text-3xl md:text-4xl font-bold mb-4 text-navy-900">
            {t.features.title}
          </h2>
          <p className="text-navy-700 text-lg max-w-2xl mx-auto">
            {t.features.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.features.items.map((feature, i) => (
            <motion.div
              key={i}
              className="group rounded-xl border border-navy-900/10 bg-white p-6 shadow-sm transition-all duration-300 hover:border-accent-blue/30"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
            >
              <div className="w-10 h-10 rounded-lg bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-cyan mb-4 group-hover:bg-accent-blue/20 transition-colors">
                {(() => {
                  const Icon = featureIcons[i] ?? ClipboardCheck;
                  return <Icon className="h-5 w-5" aria-hidden="true" />;
                })()}
              </div>
              <h3 className="text-navy-900 font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-navy-700 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

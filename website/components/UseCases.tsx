"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";

export default function UseCases() {
  const { t } = useLocale();
  const [active, setActive] = useState("ecommerce");
  const activeCase = t.useCases.items.find((uc) => uc.id === active)!;

  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.useCases.title}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            {t.useCases.subtitle}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {t.useCases.items.map((uc) => (
            <button
              key={uc.id}
              onClick={() => setActive(uc.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active === uc.id
                  ? "bg-accent-blue/10 border border-accent-blue/30 text-accent-blue"
                  : "bg-white/[0.02] border border-white/5 text-gray-400 hover:text-white hover:border-white/10"
              }`}
            >
              <span className="mr-2">{uc.icon}</span>
              {uc.title}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-2 gap-8 items-center"
          >
            <div>
              <div className="text-sm text-accent-cyan font-medium mb-2">
                {activeCase.partners}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                {activeCase.title}
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                {activeCase.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeCase.examples.map((example, i) => (
                <motion.div
                  key={example}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5"
                >
                  <svg
                    className="w-4 h-4 text-emerald-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-300 text-sm">{example}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

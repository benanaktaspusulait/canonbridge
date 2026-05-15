"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";
import { locales } from "@/lib/i18n";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { locale, setLocale, t } = useLocale();

  const currentLocale = locales.find((l) => l.code === locale)!;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-navy-900/80 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3">
          <img
            src="/images/logo-white.jpeg"
            alt="CanonBridge"
            className="h-8 w-auto"
          />
          <span className="text-lg font-semibold text-white">CanonBridge</span>
        </a>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#how-it-works"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {t.nav.howItWorks}
          </a>
          <a
            href="#sources"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {t.nav.sources}
          </a>
          <a
            href="#architecture"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {t.nav.architecture}
          </a>
          <a
            href="#features"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            {t.nav.features}
          </a>

          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-white/10 rounded-lg hover:border-white/20 transition-all"
            >
              <span>{currentLocale.flag}</span>
              <span className="hidden lg:inline">{currentLocale.code.toUpperCase()}</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 py-2 w-40 bg-navy-800 border border-white/10 rounded-xl shadow-xl overflow-hidden"
                >
                  {locales.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLocale(l.code);
                        setLangOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        locale === l.code
                          ? "text-accent-cyan bg-white/5"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a
            href="#demo"
            className="px-4 py-2 bg-gradient-to-r from-accent-blue to-accent-cyan text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-accent-blue/25 transition-shadow"
          >
            {t.nav.requestDemo}
          </a>
        </div>
      </div>
    </motion.nav>
  );
}

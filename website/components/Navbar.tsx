"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";
import { locales } from "@/lib/i18n";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { locale, setLocale, t } = useLocale();

  const currentLocale = locales.find((l) => l.code === locale)!;
  const navLinks = [
    { href: "#how-it-works", label: t.nav.howItWorks },
    { href: "#sources", label: t.nav.sources },
    { href: "#architecture", label: t.nav.architecture },
    { href: "#features", label: t.nav.features },
  ];

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
          ? "bg-white/[0.86] backdrop-blur-xl border-b border-navy-900/10 shadow-sm"
          : "bg-white/[0.72] backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" aria-label="CanonBridge home">
          <Image
            src="/images/logo-canonbridge.svg"
            alt="CanonBridge"
            width={180}
            height={40}
            className="h-8 w-auto"
            priority
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-navy-700 hover:text-navy-900 transition-colors"
            >
              {link.label}
            </a>
          ))}

          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-navy-700 hover:text-navy-900 border border-navy-900/10 rounded-lg hover:border-navy-900/20 transition-all"
              aria-expanded={langOpen}
              aria-haspopup="menu"
            >
              <span>{currentLocale.flag}</span>
              <span className="hidden lg:inline">{currentLocale.code.toUpperCase()}</span>
              <ChevronDown className="h-3 w-3" aria-hidden="true" />
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 py-2 w-40 bg-white border border-navy-900/10 rounded-xl shadow-xl overflow-hidden"
                  role="menu"
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
                          ? "text-accent-blue bg-accent-blue/10"
                          : "text-navy-700 hover:text-navy-900 hover:bg-navy-900/5"
                      }`}
                      role="menuitem"
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
            className="px-4 py-2 bg-accent-blue text-white text-sm font-medium rounded-lg hover:bg-navy-900 transition-colors"
          >
            {t.nav.requestDemo}
          </a>
        </div>

        <button
          type="button"
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-navy-900/10 text-navy-900"
          aria-label="Toggle navigation"
          aria-controls="mobile-navigation"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          {mobileOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden border-t border-navy-900/10 bg-white/[0.96] px-6 pb-5 pt-3 shadow-lg"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="min-h-11 rounded-lg px-3 py-2.5 text-sm font-medium text-navy-800 hover:bg-navy-900/5"
                >
                  {link.label}
                </a>
              ))}
              <div className="grid grid-cols-4 gap-2 pt-2">
                {locales.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLocale(l.code);
                      setMobileOpen(false);
                    }}
                    className={`min-h-11 rounded-lg border px-2 text-sm font-medium ${
                      locale === l.code
                        ? "border-accent-blue bg-accent-blue/10 text-accent-blue"
                        : "border-navy-900/10 text-navy-700"
                    }`}
                  >
                    {l.code.toUpperCase()}
                  </button>
                ))}
              </div>
              <a
                href="#demo"
                onClick={() => setMobileOpen(false)}
                className="mt-2 min-h-11 rounded-lg bg-accent-blue px-4 py-3 text-center text-sm font-semibold text-white"
              >
                {t.nav.requestDemo}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

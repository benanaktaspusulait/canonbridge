"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

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
            How It Works
          </a>
          <a
            href="#sources"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Sources
          </a>
          <a
            href="#architecture"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Architecture
          </a>
          <a
            href="#features"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Features
          </a>
          <a
            href="#demo"
            className="px-4 py-2 bg-gradient-to-r from-accent-blue to-accent-cyan text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-accent-blue/25 transition-shadow"
          >
            Request Demo
          </a>
        </div>
      </div>
    </motion.nav>
  );
}

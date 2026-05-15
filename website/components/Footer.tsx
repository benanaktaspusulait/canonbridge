"use client";

import { motion } from "framer-motion";

export default function Footer() {
  return (
    <>
      {/* CTA Section with Contact Form */}
      <section id="demo" className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-blue/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to Eliminate Your
                <br />
                <span className="gradient-text">Integration Tax?</span>
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                See how CanonBridge can replace months of custom adapter code
                with minutes of visual configuration.
              </p>
            </div>

            {/* Contact Form */}
            <div className="max-w-xl mx-auto">
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  // Form submission logic
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm text-gray-400 mb-1.5"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/25 transition-all"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm text-gray-400 mb-1.5"
                    >
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/25 transition-all"
                      placeholder="Company name"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm text-gray-400 mb-1.5"
                  >
                    Work Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/25 transition-all"
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="partners"
                    className="block text-sm text-gray-400 mb-1.5"
                  >
                    How many partner integrations do you manage?
                  </label>
                  <select
                    id="partners"
                    name="partners"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-gray-300 focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/25 transition-all appearance-none"
                  >
                    <option value="" className="bg-navy-900">Select range</option>
                    <option value="1-5" className="bg-navy-900">1–5 partners</option>
                    <option value="5-20" className="bg-navy-900">5–20 partners</option>
                    <option value="20-50" className="bg-navy-900">20–50 partners</option>
                    <option value="50+" className="bg-navy-900">50+ partners</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm text-gray-400 mb-1.5"
                  >
                    Tell us about your integration challenges
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/25 transition-all resize-none"
                    placeholder="What sources do you connect? What problems are you facing?"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full px-8 py-4 bg-gradient-to-r from-accent-blue to-accent-cyan text-white font-semibold rounded-xl shadow-lg shadow-accent-blue/25 hover:shadow-accent-blue/40 transition-shadow"
                >
                  Request a Demo
                </motion.button>

                <p className="text-center text-gray-600 text-xs">
                  We&apos;ll get back to you within 24 hours.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src="/images/logo-white.jpeg"
                alt="CanonBridge"
                className="h-7 w-auto"
              />
              <span className="text-white font-semibold">CanonBridge</span>
            </div>

            {/* Links */}
            <div className="flex items-center gap-8 text-sm text-gray-500">
              <a
                href="#how-it-works"
                className="hover:text-gray-300 transition-colors"
              >
                How It Works
              </a>
              <a
                href="#architecture"
                className="hover:text-gray-300 transition-colors"
              >
                Architecture
              </a>
              <a
                href="#features"
                className="hover:text-gray-300 transition-colors"
              >
                Features
              </a>
              <a
                href="#demo"
                className="hover:text-gray-300 transition-colors"
              >
                Contact
              </a>
            </div>

            {/* Copyright */}
            <div className="text-sm text-gray-600">
              © 2026 CanonBridge. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

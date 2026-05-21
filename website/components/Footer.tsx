"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";

export default function Footer() {
  const { t } = useLocale();
  const [status, setStatus] = useState<"idle" | "ready">("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "");
    const company = String(data.get("company") ?? "");
    const email = String(data.get("email") ?? "");
    const partners = String(data.get("partners") ?? "");
    const message = String(data.get("message") ?? "");
    const body = [
      `Name: ${name}`,
      `Company: ${company}`,
      `Email: ${email}`,
      `Partner integrations: ${partners || "Not specified"}`,
      "",
      message,
    ].join("\n");

    window.location.href = `mailto:sales@canonbridge.io?subject=${encodeURIComponent(
      `CanonBridge demo request from ${company || name}`,
    )}&body=${encodeURIComponent(body)}`;
    setStatus("ready");
    form.reset();
  }

  return (
    <>
      <section id="demo" className="relative overflow-hidden bg-[var(--cb-color-cloud-100)] py-24 md:py-32" aria-labelledby="demo-title">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 id="demo-title" className="hero-title text-3xl md:text-5xl font-bold mb-6 text-navy-900">
                {t.footer.ctaTitle1}
                <br />
                <span className="gradient-text">{t.footer.ctaTitle2}</span>
              </h2>
              <p className="text-navy-700 text-lg max-w-2xl mx-auto">
                {t.footer.ctaSubtitle}
              </p>
            </div>

            <div className="max-w-xl mx-auto">
              <form
                className="space-y-5 rounded-xl border border-navy-900/10 bg-white p-6 shadow-xl"
                onSubmit={handleSubmit}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-navy-700 mb-1.5"
                    >
                      {t.footer.formName}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white border border-navy-900/10 text-navy-900 placeholder-navy-700/45 focus:outline-none focus:ring-[var(--cb-shadow-focus)] transition-all"
                      placeholder={t.footer.formNamePlaceholder}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-medium text-navy-700 mb-1.5"
                    >
                      {t.footer.formCompany}
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      required
                      className="w-full px-4 py-3 rounded-lg bg-white border border-navy-900/10 text-navy-900 placeholder-navy-700/45 focus:outline-none focus:ring-[var(--cb-shadow-focus)] transition-all"
                      placeholder={t.footer.formCompanyPlaceholder}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-navy-700 mb-1.5"
                  >
                    {t.footer.formEmail}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white border border-navy-900/10 text-navy-900 placeholder-navy-700/45 focus:outline-none focus:ring-[var(--cb-shadow-focus)] transition-all"
                    placeholder={t.footer.formEmailPlaceholder}
                  />
                </div>

                <div>
                  <label
                    htmlFor="partners"
                    className="block text-sm font-medium text-navy-700 mb-1.5"
                  >
                    {t.footer.formPartners}
                  </label>
                  <select
                    id="partners"
                    name="partners"
                    className="w-full px-4 py-3 rounded-lg bg-white border border-navy-900/10 text-navy-900 focus:outline-none focus:ring-[var(--cb-shadow-focus)] transition-all appearance-none"
                  >
                    {t.footer.formPartnersOptions.map((opt, i) => (
                      <option key={i} value={i === 0 ? "" : opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-navy-700 mb-1.5"
                  >
                    {t.footer.formMessage}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-white border border-navy-900/10 text-navy-900 placeholder-navy-700/45 focus:outline-none focus:ring-[var(--cb-shadow-focus)] transition-all resize-none"
                    placeholder={t.footer.formMessagePlaceholder}
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full px-8 py-4 bg-accent-blue text-white font-semibold rounded-lg shadow-lg shadow-accent-blue/20 hover:bg-navy-900 transition-colors"
                >
                  {t.footer.formSubmit}
                </motion.button>

                <p className="text-center text-navy-700/70 text-xs" aria-live="polite">
                  {status === "ready"
                    ? "Your email client is ready with the demo request."
                    : t.footer.formNote}
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-navy-900/10 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo-canonbridge.svg"
                alt="CanonBridge"
                className="h-7 w-auto"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-navy-700">
              <a
                href="#how-it-works"
                className="hover:text-navy-900 transition-colors"
              >
                How It Works
              </a>
              <a
                href="#architecture"
                className="hover:text-navy-900 transition-colors"
              >
                Architecture
              </a>
              <a
                href="#features"
                className="hover:text-navy-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#demo"
                className="hover:text-navy-900 transition-colors"
              >
                Contact
              </a>
            </div>

            <div className="text-sm text-navy-700/65">
              {t.footer.copyright}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

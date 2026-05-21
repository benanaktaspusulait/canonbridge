"use client";

import Image from "next/image";
import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useLocale } from "@/lib/LocaleContext";

export default function Footer() {
  const { t } = useLocale();
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "mail" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? ""),
      company: String(data.get("company") ?? ""),
      email: String(data.get("email") ?? ""),
      partners: String(data.get("partners") ?? ""),
      message: String(data.get("message") ?? ""),
      source: "canonbridge-website",
      submittedAt: new Date().toISOString(),
    };
    const webhookUrl = process.env.NEXT_PUBLIC_LEAD_WEBHOOK_URL?.trim();

    if (webhookUrl) {
      setStatus("submitting");
      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Lead webhook returned ${response.status}`);
        }

        setStatus("sent");
        form.reset();
        return;
      } catch {
        setStatus("error");
        return;
      }
    }

    const body = [
      `Name: ${payload.name}`,
      `Company: ${payload.company}`,
      `Email: ${payload.email}`,
      `Partner integrations: ${payload.partners || "Not specified"}`,
      "",
      payload.message,
    ].join("\n");

    window.location.href = `mailto:sales@canonbridge.io?subject=${encodeURIComponent(
      `CanonBridge demo request from ${payload.company || payload.name}`,
    )}&body=${encodeURIComponent(body)}`;
    setStatus("mail");
    form.reset();
  }

  const statusMessage = {
    idle: t.footer.formNote,
    submitting: "Sending demo request...",
    sent: "Demo request sent. We will get back to you within 24 hours.",
    mail: "Your email client is ready with the demo request.",
    error: "We could not send the request. Please email sales@canonbridge.io.",
  }[status];

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
                      className="w-full px-4 py-3 rounded-lg bg-white border border-navy-900/10 text-navy-900 placeholder:text-navy-700/50 focus:outline-none focus:shadow-[var(--cb-shadow-focus)] transition-all"
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
                      className="w-full px-4 py-3 rounded-lg bg-white border border-navy-900/10 text-navy-900 placeholder:text-navy-700/50 focus:outline-none focus:shadow-[var(--cb-shadow-focus)] transition-all"
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
                    className="w-full px-4 py-3 rounded-lg bg-white border border-navy-900/10 text-navy-900 placeholder:text-navy-700/50 focus:outline-none focus:shadow-[var(--cb-shadow-focus)] transition-all"
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
                    className="w-full px-4 py-3 rounded-lg bg-white border border-navy-900/10 text-navy-900 focus:outline-none focus:shadow-[var(--cb-shadow-focus)] transition-all appearance-none"
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
                    className="w-full px-4 py-3 rounded-lg bg-white border border-navy-900/10 text-navy-900 placeholder:text-navy-700/50 focus:outline-none focus:shadow-[var(--cb-shadow-focus)] transition-all resize-none"
                    placeholder={t.footer.formMessagePlaceholder}
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={status === "submitting"}
                  className="w-full px-8 py-4 bg-accent-blue text-white font-semibold rounded-lg shadow-lg shadow-accent-blue/20 hover:bg-navy-900 transition-colors"
                >
                  {status === "submitting" ? "Sending..." : t.footer.formSubmit}
                </motion.button>

                <p className="text-center text-navy-700/70 text-xs" aria-live="polite">
                  {statusMessage}
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
              <Image
                src="/images/canonbridge-logo-wide-light.png"
                alt="CanonBridge"
                width={458}
                height={100}
                className="h-14 w-auto"
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
              <Link
                href="/component-gallery"
                className="hover:text-navy-900 transition-colors"
              >
                Components
              </Link>
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

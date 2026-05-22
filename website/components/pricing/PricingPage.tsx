"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";
import { plans, featureCategories, overagePricing, addons, faqItems } from "./pricingData";

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Header */}
      <header className="pt-28 pb-12 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-navy-600 max-w-2xl mx-auto mb-8">
            Start free. Scale as you grow. No surprises, no hidden fees.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!annual ? "text-navy-900" : "text-navy-500"}`}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                annual ? "bg-accent-blue" : "bg-navy-200"
              }`}
              aria-label="Toggle annual billing"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  annual ? "translate-x-7" : ""
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${annual ? "text-navy-900" : "text-navy-500"}`}>
              Annual
            </span>
            {annual && (
              <span className="ml-2 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            )}
          </div>
        </motion.div>
      </header>

      {/* Plan Cards */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
          {plans.filter(p => p.isPublic).map((plan, i) => (
            <motion.div
              key={plan.code}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`relative rounded-2xl border p-6 flex flex-col ${
                plan.highlighted
                  ? "border-accent-blue shadow-xl shadow-accent-blue/10 ring-2 ring-accent-blue"
                  : "border-navy-900/10 shadow-sm"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-blue text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <h3 className="text-lg font-semibold text-navy-900">{plan.name}</h3>
              <p className="text-sm text-navy-500 mt-1 mb-4">{plan.description}</p>

              <div className="mb-6">
                {plan.code === "enterprise" ? (
                  <div className="text-3xl font-bold text-navy-900">Custom</div>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-navy-900">
                      ${annual ? Math.round(plan.priceYearly / 12) : plan.priceMonthly}
                    </span>
                    <span className="text-navy-500 text-sm">/month</span>
                    {annual && plan.priceMonthly > 0 && (
                      <div className="text-xs text-navy-400 mt-1">
                        ${plan.priceYearly}/year (billed annually)
                      </div>
                    )}
                  </>
                )}
              </div>

              <a
                href={plan.code === "enterprise" ? "#demo" : plan.code === "free" ? "/signup" : "/signup?plan=" + plan.code}
                className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium text-center transition-colors mb-6 block ${
                  plan.highlighted
                    ? "bg-accent-blue text-white hover:bg-navy-900"
                    : plan.code === "enterprise"
                    ? "bg-navy-900 text-white hover:bg-navy-800"
                    : "border border-navy-900/20 text-navy-900 hover:bg-navy-50"
                }`}
              >
                {plan.code === "free" ? "Start Free" : plan.code === "enterprise" ? "Contact Sales" : "Get Started"}
              </a>

              <ul className="space-y-2.5 flex-1">
                {plan.highlights.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-navy-700">
                    <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-navy-900 text-center mb-8">
          Compare all features
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-navy-900/10">
                <th className="text-left py-3 px-4 font-medium text-navy-500 w-1/3">Feature</th>
                {plans.filter(p => p.isPublic).map(plan => (
                  <th key={plan.code} className="text-center py-3 px-4 font-semibold text-navy-900">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {featureCategories.map(category => (
                <>
                  <tr key={category.name} className="bg-navy-50/50">
                    <td colSpan={5} className="py-2 px-4 font-semibold text-navy-800 text-xs uppercase tracking-wider">
                      {category.name}
                    </td>
                  </tr>
                  {category.features.map(feature => (
                    <tr key={feature.key} className="border-b border-navy-900/5 hover:bg-navy-50/30">
                      <td className="py-2.5 px-4 text-navy-700">{feature.label}</td>
                      {plans.filter(p => p.isPublic).map(plan => {
                        const val = feature.values[plan.code];
                        return (
                          <td key={plan.code} className="text-center py-2.5 px-4">
                            {val === true ? (
                              <Check className="h-4 w-4 text-green-600 mx-auto" />
                            ) : val === false ? (
                              <X className="h-4 w-4 text-navy-300 mx-auto" />
                            ) : (
                              <span className="text-navy-700 font-medium">{val}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add-ons */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-navy-900 text-center mb-8">Add-ons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addons.map(addon => (
            <div key={addon.name} className="border border-navy-900/10 rounded-xl p-5">
              <h3 className="font-semibold text-navy-900">{addon.name}</h3>
              <p className="text-sm text-navy-500 mt-1">{addon.description}</p>
              <p className="text-sm font-medium text-accent-blue mt-2">{addon.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-navy-900 text-center mb-8">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <details key={i} className="group border border-navy-900/10 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-medium text-navy-900 hover:bg-navy-50/50">
                {item.question}
                <ArrowRight className="h-4 w-4 text-navy-400 transition-transform group-open:rotate-90" />
              </summary>
              <div className="px-5 pb-4 text-sm text-navy-600">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-900 py-16 text-center px-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Ready to get started?
        </h2>
        <p className="text-navy-300 mb-8 max-w-lg mx-auto">
          Start with the free plan. No credit card required. Upgrade anytime as your needs grow.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/signup"
            className="px-6 py-3 bg-accent-blue text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            Start Free
          </a>
          <a
            href="#demo"
            className="px-6 py-3 border border-white/20 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
          >
            Talk to Sales
          </a>
        </div>
      </section>
    </div>
  );
}

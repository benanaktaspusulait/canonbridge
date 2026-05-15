"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const useCases = [
  {
    id: "ecommerce",
    icon: "🛒",
    title: "E-Commerce & Marketplaces",
    partners: "20+ marketplace integrations",
    description:
      "Connect dozens of marketplaces and normalize order, inventory, and fulfillment events into a single canonical format. Onboard new sales channels in minutes.",
    examples: ["Order lifecycle events", "Inventory synchronization", "Shipment & tracking", "Return processing", "Price updates", "Product catalog sync"],
  },
  {
    id: "fintech",
    icon: "💳",
    title: "Fintech & Payments",
    partners: "15+ payment providers",
    description:
      "Every payment provider sends different webhook formats. CanonBridge unifies them into one payment event stream — reconciliation becomes trivial.",
    examples: ["Payment captured", "Refund processed", "Chargeback received", "Settlement reports", "KYC status updates", "Account notifications"],
  },
  {
    id: "healthcare",
    icon: "🏥",
    title: "Healthcare & Life Sciences",
    partners: "50+ hospital systems",
    description:
      "Healthcare data comes in every format imaginable. Standardize patient, appointment, and lab result events across systems while maintaining compliance.",
    examples: ["Patient admission/discharge", "Lab results", "Appointment scheduling", "Prescription updates", "Insurance claims", "Medical device data"],
  },
  {
    id: "logistics",
    icon: "🚚",
    title: "Logistics & Supply Chain",
    partners: "30+ carriers & suppliers",
    description:
      "Each carrier has its own tracking API and webhook format. One canonical shipment event for all — real-time visibility across your entire supply chain.",
    examples: ["Shipment created", "Status updates", "Delivery confirmation", "Exception handling", "Warehouse events", "Customs clearance"],
  },
  {
    id: "automotive",
    icon: "🚗",
    title: "Automotive & Dealerships",
    partners: "40+ dealer systems",
    description:
      "Dealer management systems, OEM portals, and aftermarket platforms all speak different languages. Unify vehicle, service, and sales data across your network.",
    examples: ["Vehicle inventory sync", "Service appointments", "Parts ordering", "Sales lead routing", "Warranty claims", "Telematics data"],
  },
  {
    id: "insurance",
    icon: "🛡️",
    title: "Insurance",
    partners: "25+ agency systems",
    description:
      "Policy administration, claims processing, and underwriting data from multiple carriers and agencies — standardized into one event model.",
    examples: ["Policy issuance", "Claims FNOL", "Underwriting decisions", "Premium calculations", "Agent commissions", "Regulatory reporting"],
  },
  {
    id: "manufacturing",
    icon: "🏭",
    title: "Manufacturing & IoT",
    partners: "100+ device types",
    description:
      "Sensors, PLCs, SCADA systems, and ERP platforms generate data in proprietary formats. Normalize machine events for predictive maintenance and analytics.",
    examples: ["Machine telemetry", "Quality inspections", "Production orders", "Maintenance alerts", "Energy consumption", "Supply chain signals"],
  },
  {
    id: "travel",
    icon: "✈️",
    title: "Travel & Hospitality",
    partners: "35+ booking systems",
    description:
      "GDS systems, OTAs, property management systems, and airline APIs — each with unique formats. One canonical booking and guest event model.",
    examples: ["Reservation created", "Check-in/check-out", "Rate updates", "Availability sync", "Guest preferences", "Loyalty events"],
  },
];

export default function UseCases() {
  const [active, setActive] = useState("ecommerce");
  const activeCase = useCases.find((uc) => uc.id === active)!;

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
            Built for Every Industry
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Wherever there are multiple partners sending different formats,
            CanonBridge eliminates the integration tax.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {useCases.map((uc) => (
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

"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

interface MetricProps {
  value: number;
  suffix: string;
  label: string;
  duration?: number;
}

function AnimatedMetric({ value, suffix, label, duration = 2 }: MetricProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    const stepTime = (duration * 1000) / end;
    const increment = Math.max(1, Math.floor(end / 60));

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime * increment);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text mb-2">
        {isInView ? count.toLocaleString() : "0"}
        {suffix}
      </div>
      <div className="text-gray-400 text-sm md:text-base">{label}</div>
    </div>
  );
}

export default function Metrics() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for Enterprise Scale
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Performance that doesn&apos;t compromise on reliability.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <AnimatedMetric
            value={10000}
            suffix="+"
            label="Events per second"
          />
          <AnimatedMetric
            value={200}
            suffix="ms"
            label="p99 latency"
          />
          <AnimatedMetric
            value={99}
            suffix=".9%"
            label="Uptime SLA"
          />
          <AnimatedMetric
            value={60}
            suffix="%"
            label="Cost reduction"
          />
        </div>

        {/* Secondary stats */}
        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {[
            {
              icon: "⚡",
              stat: "Minutes, not weeks",
              desc: "New partner onboarding time",
            },
            {
              icon: "🔄",
              stat: "3-tier retry",
              desc: "1m → 5m → 30m before DLQ",
            },
            {
              icon: "🛡️",
              stat: "Zero data loss",
              desc: "At-least-once with idempotency",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/5"
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <div className="text-white font-semibold">{item.stat}</div>
                <div className="text-gray-500 text-sm">{item.desc}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

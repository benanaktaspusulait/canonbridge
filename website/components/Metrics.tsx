"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { RefreshCw, ShieldCheck, Zap } from "lucide-react";
import { useLocale } from "@/lib/LocaleContext";

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

    let frame = 0;
    let startTime: number | null = null;

    const tick = (timestamp: number) => {
      startTime ??= timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.round(value * progress));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [isInView, value, duration]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold gradient-text mb-2">
        {isInView ? count.toLocaleString() : "0"}
        {suffix}
      </div>
      <div className="text-navy-700 text-sm md:text-base">{label}</div>
    </div>
  );
}

export default function Metrics() {
  const { t } = useLocale();

  return (
    <section className="relative overflow-hidden bg-[var(--cb-color-cloud-50)] py-24 md:py-32" aria-labelledby="metrics-title">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 id="metrics-title" className="hero-title text-3xl md:text-4xl font-bold mb-4 text-navy-900">
            {t.metrics.title}
          </h2>
          <p className="text-navy-700 text-lg max-w-2xl mx-auto">
            {t.metrics.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <AnimatedMetric
            value={10000}
            suffix="+"
            label={t.metrics.eventsPerSec}
          />
          <AnimatedMetric
            value={200}
            suffix="ms"
            label={t.metrics.latency}
          />
          <AnimatedMetric
            value={99}
            suffix=".9%"
            label={t.metrics.uptime}
          />
          <AnimatedMetric
            value={60}
            suffix="%"
            label={t.metrics.costReduction}
          />
        </div>
        <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-navy-700/60">
          Published figures are engineering targets and synthetic benchmark baselines; production results vary by connector mix, payload size, and deployment topology.
        </p>

        {/* Secondary stats */}
        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {[
            { icon: Zap, stat: t.metrics.stat1, desc: t.metrics.stat1desc },
            { icon: RefreshCw, stat: t.metrics.stat2, desc: t.metrics.stat2desc },
            { icon: ShieldCheck, stat: t.metrics.stat3, desc: t.metrics.stat3desc },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-navy-900/10 bg-white p-5 shadow-sm"
            >
              <item.icon className="h-7 w-7 flex-shrink-0 text-accent-blue" aria-hidden="true" />
              <div>
                <div className="text-navy-900 font-semibold">{item.stat}</div>
                <div className="text-navy-700/70 text-sm">{item.desc}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { useRef, useEffect } from "react";
import { Activity, Check, CirclePlay, Database, GitBranch, Rocket, ShieldCheck } from "lucide-react";
import { motion, useInView } from "framer-motion";

interface VideoSectionProps {
  title: string;
  subtitle: string;
  step: number;
  description: string;
  bullets: string[];
  videoSrc?: string;
  youtubeId?: string;
  reversed?: boolean;
  id?: string;
}

export default function VideoSection({
  title,
  subtitle,
  step,
  description,
  bullets,
  videoSrc,
  youtubeId,
  reversed = false,
  id,
}: VideoSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(sectionRef, { once: false, margin: "-100px" });
  const fallbackScreens = [
    {
      icon: Database,
      label: "Source setup",
      title: "Partner Sources",
      rows: ["REST API", "Kafka Topic", "SFTP Batch"],
      panel: ["Schema detected", "Auth configured", "Ingress ready"],
    },
    {
      icon: GitBranch,
      label: "Field mapping",
      title: "Visual Mapping",
      rows: ["order_id", "amount", "status"],
      panel: ["canonical.orderId", "canonical.total", "canonical.state"],
    },
    {
      icon: ShieldCheck,
      label: "Validation",
      title: "Fixture Test",
      rows: ["Input fixture", "Transform preview", "Schema check"],
      panel: ["Compatible", "No PII leak", "Ready to publish"],
    },
    {
      icon: Rocket,
      label: "Publishing",
      title: "Version Control",
      rows: ["v1.4 draft", "Approval", "Go live"],
      panel: ["Immutable version", "Rollback ready", "Audit logged"],
    },
    {
      icon: Activity,
      label: "Runtime",
      title: "Operational Health",
      rows: ["99.9% SLO", "12ms p95", "0 DLQ"],
      panel: ["Replay queue clear", "Tracing active", "Alerts healthy"],
    },
  ];
  const fallback = fallbackScreens[step - 1] ?? fallbackScreens[0];
  const FallbackIcon = fallback.icon;

  useEffect(() => {
    if (!videoRef.current) return;
    if (isInView) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [isInView]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className="relative py-24 md:py-32 overflow-hidden bg-white"
      aria-labelledby={`step-${step}-title`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div
          className={`flex flex-col ${
            reversed ? "lg:flex-row-reverse" : "lg:flex-row"
          } items-center gap-12 lg:gap-20`}
        >
          {/* Text content */}
          <motion.div
            className="flex-1 max-w-lg"
            initial={{ opacity: 0, x: reversed ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-accent-blue text-sm font-bold">
                {step}
              </span>
              <span className="text-accent-cyan text-sm font-semibold uppercase tracking-wider">
                {subtitle}
              </span>
            </div>
            <h2 id={`step-${step}-title`} className="hero-title text-3xl md:text-4xl lg:text-5xl font-bold mt-3 mb-6 leading-tight text-navy-900">
              {title}
            </h2>
            <p className="text-navy-700 text-lg leading-relaxed mb-8">
              {description}
            </p>
            <ul className="space-y-4">
              {bullets.map((bullet, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                >
                  <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-cyan" aria-hidden="true" />
                  <span className="text-navy-700">{bullet}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Laptop with video */}
          <motion.div
            className="flex-1 w-full max-w-2xl"
            initial={{ opacity: 0, x: reversed ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
          >
            <div className="laptop-frame glow-blue">
              <div className="laptop-screen">
                {youtubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1&showinfo=0`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                    title={title}
                  />
                ) : videoSrc ? (
                  <>
                    <video
                      ref={videoRef}
                      src={videoSrc}
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </>
                ) : (
                  <div className="h-full w-full bg-white p-5">
                    <div className="mb-4 flex items-center justify-between border-b border-navy-900/10 pb-3">
                      <div>
                        <div className="text-sm font-bold text-navy-900">{fallback.title}</div>
                        <div className="mt-1 text-xs text-navy-700/65">{fallback.label}</div>
                      </div>
                      <div className="inline-flex items-center gap-1.5 rounded-md bg-accent-blue px-3 py-1.5 text-xs font-semibold text-white">
                        <FallbackIcon className="h-3.5 w-3.5" aria-hidden="true" />
                        Step {step}
                      </div>
                    </div>
                    <div className="grid h-[calc(100%-64px)] grid-cols-3 gap-4">
                      <div className="space-y-3">
                        {fallback.rows.map((label) => (
                          <div key={label} className="rounded-lg border border-navy-900/10 bg-[var(--cb-color-cloud-50)] p-3">
                            <div className="mb-2 text-xs font-bold text-navy-800">{label}</div>
                            <div className="h-2 rounded bg-accent-blue/20" />
                            <div className="mt-2 h-2 w-2/3 rounded bg-navy-900/10" />
                          </div>
                        ))}
                      </div>
                      <div className="col-span-2 rounded-lg border border-navy-900/10 bg-navy-900 p-4">
                        <div className="mb-4 flex items-center gap-2">
                          <CirclePlay className="h-4 w-4 text-accent-cyan" aria-hidden="true" />
                          <span className="h-2 w-2 rounded-full bg-accent-cyan" />
                          <span className="h-2 w-2 rounded-full bg-accent-blue" />
                          <span className="h-2 w-2 rounded-full bg-accent-purple" />
                        </div>
                        <div className="space-y-3">
                          {fallback.panel.map((row) => (
                            <div key={row} className="grid grid-cols-[0.8fr_1fr] items-center gap-3">
                              <div className="h-3 rounded bg-white/[0.16]" />
                              <div className="rounded bg-accent-cyan/20 px-2 py-1 text-[10px] font-semibold text-white">
                                {row}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

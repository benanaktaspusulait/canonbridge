"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface VideoSectionProps {
  title: string;
  subtitle: string;
  description: string;
  bullets: string[];
  videoSrc: string;
  reversed?: boolean;
  id?: string;
}

export default function VideoSection({
  title,
  subtitle,
  description,
  bullets,
  videoSrc,
  reversed = false,
  id,
}: VideoSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(sectionRef, { once: false, margin: "-100px" });

  // Auto-play video when in view
  if (videoRef.current) {
    if (isInView) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }

  return (
    <section
      ref={sectionRef}
      id={id}
      className="relative py-24 md:py-32 overflow-hidden"
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
            <span className="text-accent-cyan text-sm font-semibold uppercase tracking-wider">
              {subtitle}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-3 mb-6 leading-tight">
              {title}
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
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
                  <svg
                    className="w-5 h-5 text-accent-cyan mt-0.5 flex-shrink-0"
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
                  <span className="text-gray-300">{bullet}</span>
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
                <video
                  ref={videoRef}
                  src={videoSrc}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                  poster=""
                >
                  Your browser does not support the video tag.
                </video>
                {/* Placeholder when no video */}
                {!videoSrc && (
                  <div className="absolute inset-0 flex items-center justify-center bg-navy-800">
                    <div className="text-center">
                      <svg
                        className="w-16 h-16 text-gray-600 mx-auto mb-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-gray-500 text-sm">Video placeholder</p>
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

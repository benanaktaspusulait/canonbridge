"use client";

import { motion } from "framer-motion";

const techCategories = [
  {
    label: "Transformation",
    items: [
      { name: "Node.js", version: "22 LTS" },
      { name: "TypeScript", version: "5.9" },
      { name: "JSONata", version: "2.x" },
      { name: "Fastify", version: "5.x" },
      { name: "Ajv", version: "8.x" },
    ],
  },
  {
    label: "Backend Services",
    items: [
      { name: "Java", version: "21" },
      { name: "Quarkus", version: "3.x" },
      { name: "Hibernate", version: "6.x" },
      { name: "PostgreSQL", version: "15+" },
    ],
  },
  {
    label: "Messaging & Data",
    items: [
      { name: "Apache Kafka", version: "3.x" },
      { name: "Redis", version: "7.x" },
      { name: "Schema Registry", version: "" },
    ],
  },
  {
    label: "Frontend",
    items: [
      { name: "Angular", version: "21" },
      { name: "PrimeNG", version: "21" },
      { name: "Angular CDK", version: "" },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { name: "Kubernetes", version: "1.28+" },
      { name: "Docker", version: "" },
      { name: "Helm", version: "3.x" },
      { name: "Terraform", version: "" },
    ],
  },
  {
    label: "Observability",
    items: [
      { name: "Prometheus", version: "" },
      { name: "Grafana", version: "" },
      { name: "OpenTelemetry", version: "" },
      { name: "Jaeger", version: "" },
    ],
  },
];

export default function TechStack() {
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
            Modern Tech Stack
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Battle-tested technologies chosen for performance, reliability, and
            developer experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techCategories.map((category, i) => (
            <motion.div
              key={category.label}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
                {category.label}
              </h3>
              <div className="space-y-3">
                {category.items.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-300 text-sm">{item.name}</span>
                    {item.version && (
                      <span className="text-gray-500 text-xs font-mono">
                        {item.version}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

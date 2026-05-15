export type Locale = "en" | "tr" | "de" | "es";

export const locales: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

export type Translations = typeof en;

export interface FeatureItem {
  title: string;
  description: string;
}

const en = {
  nav: {
    howItWorks: "How It Works",
    sources: "Sources",
    architecture: "Architecture",
    features: "Features",
    requestDemo: "Request Demo",
  },
  hero: {
    badge: "Enterprise Integration Platform",
    title1: "Any Source. One Format.",
    title2: "Zero Code.",
    subtitle:
      "Message queues, webhooks, REST APIs, SOAP services, file transfers, databases — connect any data source and transform it into your canonical format. Visual mapping, enterprise reliability, no engineering bottleneck.",
    cta1: "See How It Works",
    cta2: "Request Demo",
    sources: [
      "Message Queues",
      "Webhooks",
      "REST APIs",
      "SOAP/XML",
      "SFTP",
      "Cloud Storage",
      "Databases",
      "EDI",
      "File Drops",
      "Scheduled Polling",
    ],
  },
  howItWorks: {
    title: "From Any Source to Production in",
    titleHighlight: "5 Steps",
    subtitle:
      "No matter where your data comes from — message queues, webhooks, SOAP services, file transfers, or REST APIs — the workflow is the same.",
  },
  steps: {
    step1: {
      subtitle: "Connect",
      title: "Onboard Any Partner Source",
      description:
        "Add a new partner in seconds. Connect their data source — whether it's a message queue, webhook endpoint, REST API, SOAP service, SFTP folder, or cloud storage bucket. CanonBridge handles the protocol complexity.",
      bullets: [
        "10+ source types: Message Queues, Webhooks, REST, SOAP, SFTP, Cloud Storage, Databases, EDI, File Drops, Scheduled Polling",
        "Auto-detect payload structure from any format",
        "Per-partner authentication and credential management",
        "Zero infrastructure changes — just configure and go",
      ],
    },
    step2: {
      subtitle: "Map",
      title: "Drag & Drop Field Mapping",
      description:
        "Visually connect source fields to your canonical schema. No expression language knowledge needed — the platform generates transformation logic automatically from your visual mappings.",
      bullets: [
        "Drag-and-drop with visual connection lines",
        "Smart field suggestions based on names and types",
        "Support for nested objects, arrays, and complex transforms",
        "Auto-generated expressions — edit manually if you want, or don't",
      ],
    },
    step3: {
      subtitle: "Validate",
      title: "Test Before You Ship",
      description:
        "Run your mapping against real partner fixtures. See exactly what comes out, catch schema violations, and fix edge cases — all before a single event hits production.",
      bullets: [
        "Live transformation preview with real data",
        "Schema validation catches errors instantly",
        "Create fixture libraries for regression testing",
        "Side-by-side input/output comparison",
      ],
    },
    step4: {
      subtitle: "Publish",
      title: "One-Click Go Live",
      description:
        "Publish your mapping with immutable versioning. Every version is preserved — roll back to any point in seconds. Approval workflows keep your team in control.",
      bullets: [
        "Immutable versions with full audit trail",
        "Semantic versioning — rollback in one click",
        "Team approval workflow before production",
        "Zero-downtime deployment — new version activates instantly",
      ],
    },
    step5: {
      subtitle: "Monitor",
      title: "Real-Time Observability",
      description:
        "Track every event from ingestion to delivery. Per-partner health dashboards, DLQ management, distributed tracing — know exactly what's happening at all times.",
      bullets: [
        "Per-partner health scores and SLO tracking",
        "Dead letter queue with one-click retry or discard",
        "Distributed tracing across the entire pipeline",
        "Alerting: PagerDuty, Slack, email — by severity",
      ],
    },
  },
  metrics: {
    title: "Built for Enterprise Scale",
    subtitle: "Performance that doesn't compromise on reliability.",
    eventsPerSec: "Events per second",
    latency: "p99 latency",
    uptime: "Uptime SLA",
    costReduction: "Cost reduction",
    stat1: "Minutes, not weeks",
    stat1desc: "New partner onboarding time",
    stat2: "3-tier retry",
    stat2desc: "1m → 5m → 30m before DLQ",
    stat3: "Zero data loss",
    stat3desc: "At-least-once with idempotency",
  },
  scalability: {
    title: "Scales With Your Business",
    subtitle:
      "From 5 partners to 5,000. From 1,000 events per second to millions. The architecture grows with you — no re-platforming, no ceiling.",
    tiers: [
      { label: "Startup", partners: "5 partners", desc: "Single instance, minimal footprint" },
      { label: "Growth", partners: "50 partners", desc: "Horizontal scaling kicks in" },
      { label: "Enterprise", partners: "500 partners", desc: "Multi-region, full redundancy" },
      { label: "Hyperscale", partners: "Unlimited", desc: "Partition expansion, auto-scaling" },
    ],
    horizontal: "Horizontal Scaling",
    horizontalDesc: "Add more instances as load grows. Partition-based distribution ensures linear throughput increase with each node.",
    autoScaling: "Auto-Scaling",
    autoScalingDesc: "Consumer lag-driven autoscaling on Kubernetes. The platform detects backpressure and scales up automatically — scales down when quiet.",
    isolation: "Resource Isolation",
    isolationDesc: "Worker pools isolate CPU-heavy transformations from I/O. One slow partner can never block another. Per-tenant rate limits protect shared resources.",
    bottom: "No matter how many partners you onboard or how much traffic they send — CanonBridge handles it. Start small, grow without limits.",
  },
  architecture: {
    title: "Architecture That Scales",
    subtitle: "Event-driven, horizontally scalable, and fault-tolerant by design.",
    sources: ["Message Queue", "Webhook", "REST API", "SOAP", "SFTP", "Cloud Storage", "Database", "EDI"],
    ingress: "Ingress Layer",
    ingressDesc: "Protocol normalization → CanonBridge envelope",
    rawEvents: "Event Stream: raw.events",
    rawEventsDesc: "Per-tenant, per-partner partitioning",
    transformer: "Transformer Service",
    transformerTags: ["Expression Engine", "Validation", "Worker Pool", "Retry"],
    canonicalEvents: "Event Stream: canonical.events",
    canonicalEventsDesc: "Validated, versioned, stable schema",
    businessService: "Business Service",
    businessTags: ["Idempotency", "Ordering", "Outbox"],
    database: "Database",
    businessEvents: "Event Stream: business.events",
    downstream: "Downstream Services",
    legendSources: "Sources",
    legendRaw: "Raw Events",
    legendTransformation: "Transformation",
    legendCanonical: "Canonical",
    legendBusiness: "Business Logic",
  },
  features: {
    title: "Enterprise Capabilities",
    subtitle: "Everything you need to run partner integrations at scale — security, governance, observability, and reliability built in.",
    items: [
      { title: "Multi-Tenant", description: "Tenant-scoped data, mappings, credentials, and audit trails. Full isolation by design." },
      { title: "Enterprise Security", description: "mTLS, RBAC, PII masking, per-tenant encryption, sandboxed execution. SOC2 ready." },
      { title: "Retry & DLQ", description: "3-tier retry with exponential backoff. Dead letter queue with one-click replay." },
      { title: "Schema Governance", description: "JSON Schema validation on input and output. Compatibility checks before publish." },
      { title: "Immutable Versioning", description: "Every mapping version is preserved forever. Rollback to any point in seconds." },
      { title: "Full Observability", description: "Prometheus, Grafana, OpenTelemetry. Distributed tracing from ingress to delivery." },
      { title: "Auto-Scaling", description: "Horizontal scaling via partitions. Consumer lag-driven autoscaling on Kubernetes." },
      { title: "Audit Trail", description: "Every mapping change, publish, rollback, and data access is logged and traceable." },
      { title: "Outbound API Calls", description: "Enrich transformations with external REST/SOAP calls. Credential vault, allowlists, circuit breakers." },
    ],
  },
  useCases: {
    title: "Built for Every Industry",
    subtitle: "Wherever there are multiple partners sending different formats, CanonBridge eliminates the integration tax.",
    items: [
      { id: "ecommerce", icon: "🛒", title: "E-Commerce & Marketplaces", partners: "20+ marketplace integrations", description: "Connect dozens of marketplaces and normalize order, inventory, and fulfillment events into a single canonical format. Onboard new sales channels in minutes.", examples: ["Order lifecycle events", "Inventory synchronization", "Shipment & tracking", "Return processing", "Price updates", "Product catalog sync"] },
      { id: "fintech", icon: "💳", title: "Fintech & Payments", partners: "15+ payment providers", description: "Every payment provider sends different webhook formats. CanonBridge unifies them into one payment event stream — reconciliation becomes trivial.", examples: ["Payment captured", "Refund processed", "Chargeback received", "Settlement reports", "KYC status updates", "Account notifications"] },
      { id: "healthcare", icon: "🏥", title: "Healthcare & Life Sciences", partners: "50+ hospital systems", description: "Healthcare data comes in every format imaginable. Standardize patient, appointment, and lab result events across systems while maintaining compliance.", examples: ["Patient admission/discharge", "Lab results", "Appointment scheduling", "Prescription updates", "Insurance claims", "Medical device data"] },
      { id: "logistics", icon: "🚚", title: "Logistics & Supply Chain", partners: "30+ carriers & suppliers", description: "Each carrier has its own tracking API and webhook format. One canonical shipment event for all — real-time visibility across your entire supply chain.", examples: ["Shipment created", "Status updates", "Delivery confirmation", "Exception handling", "Warehouse events", "Customs clearance"] },
      { id: "automotive", icon: "🚗", title: "Automotive & Dealerships", partners: "40+ dealer systems", description: "Dealer management systems, OEM portals, and aftermarket platforms all speak different languages. Unify vehicle, service, and sales data across your network.", examples: ["Vehicle inventory sync", "Service appointments", "Parts ordering", "Sales lead routing", "Warranty claims", "Telematics data"] },
      { id: "insurance", icon: "🛡️", title: "Insurance", partners: "25+ agency systems", description: "Policy administration, claims processing, and underwriting data from multiple carriers and agencies — standardized into one event model.", examples: ["Policy issuance", "Claims FNOL", "Underwriting decisions", "Premium calculations", "Agent commissions", "Regulatory reporting"] },
      { id: "manufacturing", icon: "🏭", title: "Manufacturing & IoT", partners: "100+ device types", description: "Sensors, PLCs, SCADA systems, and ERP platforms generate data in proprietary formats. Normalize machine events for predictive maintenance and analytics.", examples: ["Machine telemetry", "Quality inspections", "Production orders", "Maintenance alerts", "Energy consumption", "Supply chain signals"] },
      { id: "travel", icon: "✈️", title: "Travel & Hospitality", partners: "35+ booking systems", description: "GDS systems, OTAs, property management systems, and airline APIs — each with unique formats. One canonical booking and guest event model.", examples: ["Reservation created", "Check-in/check-out", "Rate updates", "Availability sync", "Guest preferences", "Loyalty events"] },
    ],
  },
  footer: {
    ctaTitle1: "Ready to Eliminate Your",
    ctaTitle2: "Integration Tax?",
    ctaSubtitle: "See how CanonBridge can replace months of custom adapter code with minutes of visual configuration.",
    formName: "Name",
    formNamePlaceholder: "Your name",
    formCompany: "Company",
    formCompanyPlaceholder: "Company name",
    formEmail: "Work Email",
    formEmailPlaceholder: "you@company.com",
    formPartners: "How many partner integrations do you manage?",
    formPartnersOptions: ["Select range", "1–5 partners", "5–20 partners", "20–50 partners", "50+ partners"],
    formMessage: "Tell us about your integration challenges",
    formMessagePlaceholder: "What sources do you connect? What problems are you facing?",
    formSubmit: "Request a Demo",
    formNote: "We'll get back to you within 24 hours.",
    copyright: "© 2026 CanonBridge. All rights reserved.",
  },
};

export default en;

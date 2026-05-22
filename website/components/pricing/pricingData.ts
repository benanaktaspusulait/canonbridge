export interface Plan {
  code: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  isPublic: boolean;
  highlighted: boolean;
  highlights: string[];
}

export const plans: Plan[] = [
  {
    code: "free",
    name: "Free",
    description: "For developers and hobby projects",
    priceMonthly: 0,
    priceYearly: 0,
    isPublic: true,
    highlighted: false,
    highlights: [
      "1,000 mapping runs/month",
      "5,000 transform requests/month",
      "3 active mappings",
      "2 webhook endpoints",
      "7-day log retention",
      "1 user",
      "Community support",
    ],
  },
  {
    code: "starter",
    name: "Starter",
    description: "For small teams getting started",
    priceMonthly: 29,
    priceYearly: 278,
    isPublic: true,
    highlighted: false,
    highlights: [
      "25,000 mapping runs/month",
      "100,000 transform requests/month",
      "25 active mappings",
      "10 webhook endpoints",
      "30-day log retention",
      "3 users",
      "Email support (48h)",
    ],
  },
  {
    code: "growth",
    name: "Growth",
    description: "For growing businesses",
    priceMonthly: 149,
    priceYearly: 1430,
    isPublic: true,
    highlighted: true,
    highlights: [
      "250,000 mapping runs/month",
      "1M transform requests/month",
      "200 active mappings",
      "50 webhook endpoints",
      "90-day log retention",
      "10 users",
      "Google SSO",
      "Email support (24h)",
    ],
  },
  {
    code: "enterprise",
    name: "Enterprise",
    description: "Custom pricing for large organizations",
    priceMonthly: 0,
    priceYearly: 0,
    isPublic: true,
    highlighted: false,
    highlights: [
      "Unlimited mapping runs",
      "Unlimited transform requests",
      "Unlimited active mappings",
      "Unlimited webhook endpoints",
      "365+ day retention",
      "Unlimited users",
      "SAML/OIDC + SCIM",
      "VPC peering & PrivateLink",
      "Dedicated CSM",
      "99.95% SLA + credits",
    ],
  },
];

export interface FeatureCategory {
  name: string;
  features: {
    key: string;
    label: string;
    values: Record<string, string | boolean>;
  }[];
}

export const featureCategories: FeatureCategory[] = [
  {
    name: "Usage",
    features: [
      { key: "mapping_runs", label: "Mapping runs / month", values: { free: "1,000", starter: "25,000", growth: "250,000", enterprise: "Unlimited" } },
      { key: "transform_requests", label: "Transform requests / month", values: { free: "5,000", starter: "100,000", growth: "1,000,000", enterprise: "Unlimited" } },
      { key: "webhook_events", label: "Webhook events / month", values: { free: "10,000", starter: "200,000", growth: "2,000,000", enterprise: "Unlimited" } },
      { key: "lead_captures", label: "Lead captures / month", values: { free: "500", starter: "10,000", growth: "100,000", enterprise: "Unlimited" } },
    ],
  },
  {
    name: "Platform",
    features: [
      { key: "active_mappings", label: "Active mappings", values: { free: "3", starter: "25", growth: "200", enterprise: "Unlimited" } },
      { key: "webhook_endpoints", label: "Webhook endpoints", values: { free: "2", starter: "10", growth: "50", enterprise: "Unlimited" } },
      { key: "seats", label: "Team members", values: { free: "1", starter: "3", growth: "10", enterprise: "Unlimited" } },
      { key: "environments", label: "Environments", values: { free: "dev", starter: "dev + staging", growth: "+ prod", enterprise: "Unlimited" } },
      { key: "retention", label: "Log retention", values: { free: "7 days", starter: "30 days", growth: "90 days", enterprise: "365+ days" } },
    ],
  },
  {
    name: "Security & Compliance",
    features: [
      { key: "sso", label: "SSO", values: { free: false, starter: false, growth: "Google", enterprise: "SAML/OIDC + SCIM" } },
      { key: "audit_log", label: "Audit log", values: { free: false, starter: "7 days", growth: "30 days", enterprise: "365 days + export" } },
      { key: "rbac", label: "RBAC", values: { free: "Basic", starter: "Basic", growth: "Roles", enterprise: "Custom + ABAC" } },
      { key: "dpa", label: "DPA", values: { free: false, starter: false, growth: true, enterprise: true } },
      { key: "soc2", label: "SOC 2 Type II", values: { free: false, starter: false, growth: false, enterprise: true } },
      { key: "private_network", label: "Private networking", values: { free: false, starter: false, growth: false, enterprise: "VPC + PrivateLink" } },
    ],
  },
  {
    name: "Support",
    features: [
      { key: "sla", label: "SLA", values: { free: "Best effort", starter: "99.0%", growth: "99.5%", enterprise: "99.95% + credits" } },
      { key: "support", label: "Support", values: { free: "Community", starter: "Email (48h)", growth: "Email (24h)", enterprise: "Dedicated CSM" } },
      { key: "sandbox", label: "Sandbox", values: { free: "Shared", starter: "Shared", growth: "Isolated", enterprise: "Dedicated" } },
    ],
  },
];

export const overagePricing = [
  { unit: "1,000 mapping runs", starter: "$1.20", growth: "$0.90" },
  { unit: "10,000 transforms", starter: "$2.50", growth: "$1.80" },
  { unit: "10,000 webhook events", starter: "$1.00", growth: "$0.70" },
  { unit: "1,000 leads", starter: "$4.00", growth: "$3.00" },
  { unit: "1 GB storage / month", starter: "$0.15", growth: "$0.12" },
];

export const addons = [
  { name: "Extra seat", description: "Add more team members to your organization", price: "$12 / user / month" },
  { name: "Extra environment", description: "Additional deployment environment (staging, prod)", price: "$39 / env / month" },
  { name: "Extended retention", description: "Add 90 days of additional log retention", price: "$25 / month" },
  { name: "AI Mapping Assistant", description: "AI-powered mapping suggestions (usage-based)", price: "$0.002 / 1K input tokens" },
  { name: "Premium Support (24/7)", description: "Round-the-clock support with dedicated engineer", price: "$499 / month" },
  { name: "Private Connector", description: "Custom connector development + maintenance", price: "$1,500 one-time + $99/mo" },
];

export const faqItems = [
  {
    question: "What happens when I exceed my plan quota?",
    answer: "On the Free plan, requests are blocked (HTTP 429) with an upgrade prompt. On paid plans, you can opt-in to overage billing — usage beyond your quota is charged at per-unit rates. You can set a monthly overage cap to control costs.",
  },
  {
    question: "Can I switch plans at any time?",
    answer: "Yes. Upgrades take effect immediately with prorated billing. Downgrades take effect at the end of your current billing period. Your data is always preserved.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer: "Yes — 14-day Growth trial, no credit card required. At the end of the trial, you automatically move to the Free plan unless you upgrade.",
  },
  {
    question: "What's the annual billing discount?",
    answer: "Annual billing saves 20% compared to monthly (equivalent to 2 months free). You can switch between monthly and annual at any time.",
  },
  {
    question: "Do you offer discounts for startups or nonprofits?",
    answer: "Yes. Seed-stage startups get 1 year of Growth free (application-based). Nonprofits and open-source projects get 50% off. Students and educators get Growth at $9/month.",
  },
  {
    question: "How does Enterprise pricing work?",
    answer: "Enterprise plans are custom-quoted based on your usage, compliance requirements, and support needs. Contact our sales team for a tailored proposal.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes. All data is encrypted at rest and in transit. We use Paddle as our Merchant of Record (PCI-compliant), so we never store credit card details. SOC 2 Type II certification is on our roadmap.",
  },
  {
    question: "Can I export my data if I cancel?",
    answer: "Absolutely. You can export all your mappings, schemas, and configuration at any time. After cancellation, data is retained for 30 days before deletion.",
  },
];

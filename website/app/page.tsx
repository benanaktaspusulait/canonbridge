import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import VideoSection from "@/components/VideoSection";
import Metrics from "@/components/Metrics";
import Scalability from "@/components/Scalability";
import Architecture from "@/components/Architecture";
import Features from "@/components/Features";
import UseCases from "@/components/UseCases";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />

      {/* Section divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* How It Works heading */}
      <section id="how-it-works" className="pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            From Any Source to Production in{" "}
            <span className="gradient-text">5 Steps</span>
          </h2>
          <p className="text-gray-400 text-lg">
            No matter where your data comes from — Kafka streams, webhooks, SOAP
            services, SFTP drops, or REST APIs — the workflow is the same.
          </p>
        </div>
      </section>

      <VideoSection
        id="sources"
        step={1}
        subtitle="Connect"
        title="Onboard Any Partner Source"
        description="Add a new partner in seconds. Connect their data source — whether it's a Kafka topic, webhook endpoint, REST API, SOAP service, SFTP folder, or S3 bucket. CanonBridge handles the protocol complexity."
        bullets={[
          "10+ source types: Message Queues, Webhooks, REST, SOAP, SFTP, Cloud Storage, Databases, EDI, File Drops, Scheduled Polling",
          "Auto-detect payload structure from any format",
          "Per-partner authentication and credential management",
          "Zero infrastructure changes — just configure and go",
        ]}
        videoSrc="/videos/onboard-source.mp4"
      />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <VideoSection
        step={2}
        subtitle="Map"
        title="Drag & Drop Field Mapping"
        description="Visually connect source fields to your canonical schema. No JSONata knowledge needed — the platform generates transformation logic automatically from your visual mappings."
        bullets={[
          "Drag-and-drop with visual connection lines",
          "Smart field suggestions based on names and types",
          "Support for nested objects, arrays, and complex transforms",
          "Auto-generated JSONata — edit manually if you want, or don't",
        ]}
        videoSrc="/videos/field-mapping.mp4"
        reversed
      />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <VideoSection
        step={3}
        subtitle="Validate"
        title="Test Before You Ship"
        description="Run your mapping against real partner fixtures. See exactly what comes out, catch schema violations, and fix edge cases — all before a single event hits production."
        bullets={[
          "Live transformation preview with real data",
          "Schema validation catches errors instantly",
          "Create fixture libraries for regression testing",
          "Side-by-side input/output comparison",
        ]}
        videoSrc="/videos/test-validate.mp4"
      />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <VideoSection
        step={4}
        subtitle="Publish"
        title="One-Click Go Live"
        description="Publish your mapping with immutable versioning. Every version is preserved — roll back to any point in seconds. Approval workflows keep your team in control."
        bullets={[
          "Immutable versions with full audit trail",
          "Semantic versioning — rollback in one click",
          "Team approval workflow before production",
          "Zero-downtime deployment — new version activates instantly",
        ]}
        videoSrc="/videos/publish.mp4"
        reversed
      />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <VideoSection
        step={5}
        subtitle="Monitor"
        title="Real-Time Observability"
        description="Track every event from ingestion to delivery. Per-partner health dashboards, DLQ management, distributed tracing — know exactly what's happening at all times."
        bullets={[
          "Per-partner health scores and SLO tracking",
          "Dead letter queue with one-click retry or discard",
          "Distributed tracing across the entire pipeline",
          "Alerting: PagerDuty, Slack, email — by severity",
        ]}
        videoSrc="/videos/monitor.mp4"
      />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <Metrics />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <Scalability />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <Architecture />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <Features />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <UseCases />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <Footer />
    </main>
  );
}

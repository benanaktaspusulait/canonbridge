import Hero from "@/components/Hero";
import VideoSection from "@/components/VideoSection";

export default function Home() {
  return (
    <main>
      <Hero />

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <VideoSection
        id="demo"
        subtitle="Step 1"
        title="Upload & Map Visually"
        description="Drop your partner's sample JSON and watch the structure unfold. Drag fields to their canonical targets — no code, no JSONata knowledge required."
        bullets={[
          "Auto-detect JSON structure from any partner format",
          "Drag-and-drop field mapping with visual connections",
          "Smart suggestions based on field names and types",
          "Support for nested objects, arrays, and complex transforms",
        ]}
        videoSrc="/videos/upload-map.mp4"
      />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <VideoSection
        subtitle="Step 2"
        title="Preview & Publish"
        description="See your transformation results in real-time before going live. One-click publish with immutable versioning and instant rollback."
        bullets={[
          "Live transformation preview with actual partner data",
          "Schema validation catches errors before production",
          "Immutable versions — rollback to any point in seconds",
          "Approval workflow for team collaboration",
        ]}
        videoSrc="/videos/preview-publish.mp4"
        reversed
      />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <VideoSection
        subtitle="Step 3"
        title="Monitor in Real-Time"
        description="Full observability from ingestion to delivery. Track every event, catch errors instantly, and resolve issues before they impact business."
        bullets={[
          "Real-time event flow visualization",
          "Per-partner health dashboards and SLO tracking",
          "Dead letter queue management with one-click retry",
          "Distributed tracing across the entire pipeline",
        ]}
        videoSrc="/videos/monitor.mp4"
      />
    </main>
  );
}

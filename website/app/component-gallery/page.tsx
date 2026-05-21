import Link from "next/link";
import { Activity, ArrowLeft, Check, Database, KeyRound, Network } from "lucide-react";

const swatches = [
  ["Ink", "var(--cb-color-ink-950)"],
  ["Brand", "var(--cb-color-brand-600)"],
  ["Signal", "var(--cb-color-signal-500)"],
  ["Cloud", "var(--cb-color-cloud-100)"],
  ["Blue", "var(--cb-color-blue-600)"],
  ["Violet", "var(--cb-color-violet-600)"],
];

const cards = [
  { icon: Network, title: "Source intake", text: "Partner payloads arrive from queues, APIs, files, and webhooks." },
  { icon: Database, title: "Canonical mapping", text: "Field rules normalize partner formats into a stable event model." },
  { icon: Activity, title: "Runtime health", text: "Batch, schedule, and outbox recovery surfaces stay observable." },
];

export const metadata = {
  title: "Component Gallery",
  description: "CanonBridge shared component, token, and interaction gallery.",
};

export default function ComponentGalleryPage() {
  return (
    <main className="min-h-screen bg-[var(--cb-color-cloud-50)] px-6 py-10 text-navy-900">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-accent-blue">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to website
        </Link>

        <header className="mb-12">
          <p className="mb-3 text-sm font-bold uppercase tracking-wider text-accent-cyan">CanonBridge UI</p>
          <h1 className="hero-title max-w-3xl text-5xl font-bold leading-tight">Component Gallery</h1>
          <p className="mt-4 max-w-2xl text-lg text-navy-700">
            Shared tokens, buttons, cards, form controls, and icon conventions used by the marketing site and product UI.
          </p>
        </header>

        <section className="mb-12 rounded-xl border border-navy-900/10 bg-white p-6 shadow-sm" aria-labelledby="colors-title">
          <h2 id="colors-title" className="hero-title mb-5 text-2xl font-bold">Tokens</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {swatches.map(([label, value]) => (
              <div key={label} className="rounded-lg border border-navy-900/10 p-4">
                <div className="mb-3 h-16 rounded-md border border-navy-900/10" style={{ background: value }} />
                <div className="font-semibold">{label}</div>
                <code className="text-xs text-navy-700">{value}</code>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 grid gap-5 md:grid-cols-3" aria-labelledby="cards-title">
          <h2 id="cards-title" className="sr-only">Cards</h2>
          {cards.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-xl border border-navy-900/10 bg-white p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-accent-blue/20 bg-accent-blue/10 text-accent-blue">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-lg font-bold">{title}</h3>
              <p className="text-sm leading-relaxed text-navy-700">{text}</p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-navy-900/10 bg-white p-6 shadow-sm" aria-labelledby="controls-title">
          <h2 id="controls-title" className="hero-title mb-5 text-2xl font-bold">Controls</h2>
          <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-navy-700">Work email</span>
              <input className="w-full rounded-lg border border-navy-900/10 px-4 py-3 focus:outline-none focus:shadow-[var(--cb-shadow-focus)]" placeholder="you@company.com" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-navy-700">Integration count</span>
              <select className="w-full rounded-lg border border-navy-900/10 px-4 py-3 focus:outline-none focus:shadow-[var(--cb-shadow-focus)]">
                <option>1-5 partners</option>
                <option>5-20 partners</option>
                <option>20-50 partners</option>
              </select>
            </label>
            <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-accent-blue px-5 font-semibold text-white">
              <Check className="h-4 w-4" aria-hidden="true" />
              Submit
            </button>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-navy-900/10 bg-[var(--cb-color-cloud-50)] px-3 py-2 text-sm text-navy-700">
            <KeyRound className="h-4 w-4 text-accent-cyan" aria-hidden="true" />
            Icons use lucide-react.
          </div>
        </section>
      </div>
    </main>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Processing Agreement | CanonBridge",
  description: "CanonBridge DPA — our commitment to GDPR-compliant data processing.",
};

export default function DpaPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-28">
      <h1 className="text-3xl font-bold text-navy-900 mb-6">Data Processing Agreement (DPA)</h1>
      <p className="text-sm text-navy-500 mb-8">Last updated: May 2026 • Available on Growth+ plans</p>

      <div className="prose prose-navy max-w-none space-y-6 text-navy-700 text-sm leading-relaxed">
        <h2 className="text-lg font-semibold text-navy-900">1. Scope</h2>
        <p>This Data Processing Agreement (&quot;DPA&quot;) forms part of the agreement between you (&quot;Controller&quot;) and CanonBridge (&quot;Processor&quot;) for the processing of personal data through the Service.</p>

        <h2 className="text-lg font-semibold text-navy-900">2. Processing Details</h2>
        <p><strong>Subject matter:</strong> Data integration and transformation services.</p>
        <p><strong>Duration:</strong> For the term of the subscription agreement.</p>
        <p><strong>Nature and purpose:</strong> Processing personal data as part of data transformation workflows configured by the Controller.</p>
        <p><strong>Categories of data subjects:</strong> As determined by the Controller&apos;s use of the Service.</p>

        <h2 className="text-lg font-semibold text-navy-900">3. Processor Obligations</h2>
        <p>CanonBridge shall: process data only on documented instructions from the Controller; ensure personnel are bound by confidentiality; implement appropriate technical and organizational measures; assist with data subject requests; delete or return data upon termination.</p>

        <h2 className="text-lg font-semibold text-navy-900">4. Sub-processors</h2>
        <p>A current list of sub-processors is maintained at /subprocessors. We will notify you of changes 30 days in advance.</p>

        <h2 className="text-lg font-semibold text-navy-900">5. International Transfers</h2>
        <p>Where data is transferred outside the EEA, we rely on Standard Contractual Clauses (SCCs) as approved by the European Commission.</p>

        <h2 className="text-lg font-semibold text-navy-900">6. Security Measures</h2>
        <p>We implement: encryption at rest (AES-256) and in transit (TLS 1.3); access controls and audit logging; regular penetration testing; incident response procedures with 72-hour breach notification.</p>

        <h2 className="text-lg font-semibold text-navy-900">7. Audits</h2>
        <p>Upon reasonable request, we will provide audit reports (SOC 2 Type II when available) or allow Controller audits with 30 days notice.</p>

        <h2 className="text-lg font-semibold text-navy-900">8. Data Deletion</h2>
        <p>Upon termination, all personal data will be deleted within 30 days unless retention is required by law.</p>

        <h2 className="text-lg font-semibold text-navy-900">Contact</h2>
        <p>To execute this DPA or for questions: legal@canonbridge.io</p>
      </div>
    </div>
  );
}

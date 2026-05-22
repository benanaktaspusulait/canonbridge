import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | CanonBridge",
  description: "CanonBridge Privacy Policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-28">
      <h1 className="text-3xl font-bold text-navy-900 mb-6">Privacy Policy</h1>
      <p className="text-sm text-navy-500 mb-8">Last updated: May 2026</p>

      <div className="prose prose-navy max-w-none space-y-6 text-navy-700 text-sm leading-relaxed">
        <h2 className="text-lg font-semibold text-navy-900">1. Introduction</h2>
        <p>CanonBridge (&quot;we&quot;, &quot;us&quot;) is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal data in compliance with GDPR, KVKK, and other applicable data protection regulations.</p>

        <h2 className="text-lg font-semibold text-navy-900">2. Data We Collect</h2>
        <p><strong>Account data:</strong> Name, email address, company name, billing address.</p>
        <p><strong>Usage data:</strong> API call counts, feature usage, login timestamps, IP addresses.</p>
        <p><strong>Payment data:</strong> Processed by Paddle (our Merchant of Record). We do not store credit card numbers.</p>
        <p><strong>Integration data:</strong> Data you process through our platform is transient and not stored beyond your configured retention period.</p>

        <h2 className="text-lg font-semibold text-navy-900">3. How We Use Your Data</h2>
        <p>We use your data to: provide and improve the Service, process payments, send service communications, enforce usage limits, and comply with legal obligations.</p>

        <h2 className="text-lg font-semibold text-navy-900">4. Data Retention</h2>
        <p>Account data is retained while your account is active and for 30 days after deletion. Usage logs are retained per your plan&apos;s retention period (7–365 days). Integration data is transient.</p>

        <h2 className="text-lg font-semibold text-navy-900">5. Data Sharing</h2>
        <p>We do not sell your data. We share data only with: Paddle (payments), infrastructure providers (hosting), and when required by law. See our sub-processor list at /subprocessors.</p>

        <h2 className="text-lg font-semibold text-navy-900">6. Your Rights</h2>
        <p>Under GDPR/KVKK, you have the right to: access your data, rectify inaccuracies, request deletion, restrict processing, data portability, and object to processing. Contact privacy@canonbridge.io to exercise these rights.</p>

        <h2 className="text-lg font-semibold text-navy-900">7. Security</h2>
        <p>We implement industry-standard security measures including encryption at rest and in transit, access controls, regular security audits, and incident response procedures.</p>

        <h2 className="text-lg font-semibold text-navy-900">8. Cookies</h2>
        <p>We use essential cookies for authentication and session management. Analytics cookies are only used with your consent.</p>

        <h2 className="text-lg font-semibold text-navy-900">9. International Transfers</h2>
        <p>Data may be processed in the EU and US. We use Standard Contractual Clauses for transfers outside the EEA. EU region hosting is available on Scale+ plans.</p>

        <h2 className="text-lg font-semibold text-navy-900">10. Contact</h2>
        <p>Data Protection Officer: privacy@canonbridge.io</p>
      </div>
    </div>
  );
}

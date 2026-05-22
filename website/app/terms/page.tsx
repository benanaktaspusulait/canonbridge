import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | CanonBridge",
  description: "CanonBridge Terms of Service — the rules and guidelines for using our platform.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-28">
      <h1 className="text-3xl font-bold text-navy-900 mb-6">Terms of Service</h1>
      <p className="text-sm text-navy-500 mb-8">Last updated: May 2026</p>

      <div className="prose prose-navy max-w-none space-y-6 text-navy-700 text-sm leading-relaxed">
        <h2 className="text-lg font-semibold text-navy-900">1. Acceptance of Terms</h2>
        <p>By accessing or using CanonBridge (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>

        <h2 className="text-lg font-semibold text-navy-900">2. Description of Service</h2>
        <p>CanonBridge provides an integration platform for data transformation, schema mapping, webhook management, and related services. The Service is offered under various subscription plans as described on our pricing page.</p>

        <h2 className="text-lg font-semibold text-navy-900">3. Account Registration</h2>
        <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials and for all activities under your account.</p>

        <h2 className="text-lg font-semibold text-navy-900">4. Subscription and Billing</h2>
        <p>Paid plans are billed in advance on a monthly or annual basis. Payments are processed by Paddle.com (our Merchant of Record). You agree to pay all fees associated with your selected plan. Failure to pay may result in service suspension.</p>

        <h2 className="text-lg font-semibold text-navy-900">5. Usage Limits</h2>
        <p>Each plan includes usage quotas. Exceeding your quota may result in throttling or additional charges if overage billing is enabled. We will notify you before enforcing limits.</p>

        <h2 className="text-lg font-semibold text-navy-900">6. Acceptable Use</h2>
        <p>You may not use the Service for illegal activities, to distribute malware, for cryptocurrency mining, mass email sending, or any activity that violates applicable laws. We reserve the right to suspend accounts that violate this policy.</p>

        <h2 className="text-lg font-semibold text-navy-900">7. Data Ownership</h2>
        <p>You retain ownership of all data you process through the Service. We do not claim any intellectual property rights over your data, mappings, or configurations.</p>

        <h2 className="text-lg font-semibold text-navy-900">8. Service Availability</h2>
        <p>We strive to maintain high availability as specified in your plan&apos;s SLA. However, we do not guarantee uninterrupted access. Scheduled maintenance will be communicated in advance.</p>

        <h2 className="text-lg font-semibold text-navy-900">9. Termination</h2>
        <p>You may cancel your subscription at any time. Upon cancellation, your data will be retained for 30 days before deletion. We may terminate accounts that violate these terms.</p>

        <h2 className="text-lg font-semibold text-navy-900">10. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, CanonBridge shall not be liable for indirect, incidental, or consequential damages arising from use of the Service.</p>

        <h2 className="text-lg font-semibold text-navy-900">11. Changes to Terms</h2>
        <p>We may update these terms from time to time. Material changes will be communicated via email at least 30 days before taking effect.</p>

        <h2 className="text-lg font-semibold text-navy-900">12. Contact</h2>
        <p>For questions about these terms, contact us at legal@canonbridge.io.</p>
      </div>
    </div>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sub-processors | CanonBridge",
  description: "List of third-party sub-processors used by CanonBridge.",
};

const subprocessors = [
  { name: "Paddle.com", purpose: "Payment processing (Merchant of Record)", location: "UK/EU", dpaUrl: "https://www.paddle.com/legal/dpa" },
  { name: "Amazon Web Services (AWS)", purpose: "Cloud infrastructure hosting", location: "EU (Frankfurt)", dpaUrl: "https://aws.amazon.com/compliance/gdpr-center/" },
  { name: "Cloudflare", purpose: "CDN, DDoS protection, edge computing", location: "Global (EU processing)", dpaUrl: "https://www.cloudflare.com/trust-hub/gdpr/" },
  { name: "Confluent Cloud", purpose: "Managed Kafka (event streaming)", location: "EU", dpaUrl: "https://www.confluent.io/trust-and-security/" },
  { name: "Resend", purpose: "Transactional email delivery", location: "US", dpaUrl: "https://resend.com/legal/dpa" },
  { name: "Grafana Cloud", purpose: "Monitoring and observability", location: "EU", dpaUrl: "https://grafana.com/legal/dpa/" },
];

export default function SubprocessorsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-28">
      <h1 className="text-3xl font-bold text-navy-900 mb-4">Sub-processors</h1>
      <p className="text-navy-600 mb-8">
        The following third-party service providers process data on behalf of CanonBridge.
        We notify customers 30 days before adding new sub-processors.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-navy-200">
              <th className="text-left py-3 px-4 font-semibold text-navy-900">Provider</th>
              <th className="text-left py-3 px-4 font-semibold text-navy-900">Purpose</th>
              <th className="text-left py-3 px-4 font-semibold text-navy-900">Location</th>
              <th className="text-left py-3 px-4 font-semibold text-navy-900">DPA</th>
            </tr>
          </thead>
          <tbody>
            {subprocessors.map((sp) => (
              <tr key={sp.name} className="border-b border-navy-100 hover:bg-navy-50/30">
                <td className="py-3 px-4 font-medium text-navy-900">{sp.name}</td>
                <td className="py-3 px-4 text-navy-600">{sp.purpose}</td>
                <td className="py-3 px-4 text-navy-600">{sp.location}</td>
                <td className="py-3 px-4">
                  <a href={sp.dpaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-sm text-navy-500">
        Last updated: May 2026. For questions, contact legal@canonbridge.io.
      </p>
    </div>
  );
}

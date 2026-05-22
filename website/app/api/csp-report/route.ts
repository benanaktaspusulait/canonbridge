export const runtime = "nodejs";

// W-V8-M2 FIX: Size cap, logging, and proper CSP report handling
const MAX_BODY_BYTES = 8192;

export async function POST(request: Request) {
  // Size cap to prevent DoS
  const contentLength = parseInt(request.headers.get("content-length") ?? "0", 10);
  if (contentLength > MAX_BODY_BYTES) {
    return new Response(null, { status: 413 });
  }

  try {
    const body = await request.text();
    if (body.length > MAX_BODY_BYTES) {
      return new Response(null, { status: 413 });
    }

    // Parse and log CSP violation summary
    const report = JSON.parse(body);
    const violation = report["csp-report"] ?? report;
    console.warn("[CSP Violation]", {
      documentUri: violation["document-uri"] ?? violation.documentURL,
      violatedDirective: violation["violated-directive"] ?? violation.effectiveDirective,
      blockedUri: violation["blocked-uri"] ?? violation.blockedURL,
      sourceFile: violation["source-file"] ?? violation.sourceFile,
    });
  } catch {
    // Malformed report — ignore
  }

  return new Response(null, { status: 204 });
}

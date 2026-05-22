import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const locale = request.nextUrl.pathname.split("/").filter(Boolean)[0];
  requestHeaders.set("x-canonbridge-locale", locale ?? "en");

  if (
    request.nextUrl.pathname.startsWith("/component-gallery") &&
    process.env.CANONBRIDGE_COMPONENT_GALLERY_ENABLED !== "true"
  ) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  // Generate per-request CSP nonce for inline scripts
  const nonce = generateNonce();
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // Override CSP with nonce — replaces 'unsafe-inline' for script-src
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' https://challenges.cloudflare.com`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self' data:`,
    `connect-src 'self' https:`,
    `frame-src https://challenges.cloudflare.com https://www.youtube.com https://www.youtube-nocookie.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'self'`,
    `report-uri /api/csp-report`,
    `report-to canonbridge-csp`,
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  return response;
}

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|_next/data|favicon.ico|images|videos).*)"],
};

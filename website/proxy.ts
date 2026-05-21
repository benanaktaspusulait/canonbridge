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

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|videos).*)"],
};

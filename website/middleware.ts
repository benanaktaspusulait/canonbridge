import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/component-gallery") &&
    process.env.CANONBRIDGE_COMPONENT_GALLERY_ENABLED !== "true"
  ) {
    return new NextResponse("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/component-gallery/:path*"],
};

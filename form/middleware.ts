import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security headers for all routes. Auth for /admin/dashboard is enforced in
 * `app/admin/dashboard/layout.tsx` (Node runtime) so we can use jsonwebtoken.
 */
/** Signature required by Next.js; auth runs in Node (dashboard layout + APIs). */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- required middleware arg
export function middleware(_request: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  return res;
}

export const config = {
  matcher: [
    /*
     * Skip all of `/_next/*` (RSC payloads, chunks, manifests, image, etc.),
     * `/api/*`, and typical static files. Running middleware on those breaks
     * hard refreshes / client navigation on some hosts.
     */
    "/((?!_next/|api/|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};

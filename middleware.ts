import { NextResponse, NextRequest } from "next/server";

const TOKEN_COOKIE = "ss_token";

function base64UrlDecode(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return atob(padded);
}

// Reads the `role` claim WITHOUT verifying the token's signature. A
// forged cookie could lie here — that's fine, because nothing this
// function returns is ever trusted for an actual authorization decision;
// it only decides whether middleware bothers pre-redirecting. Real
// verification (jwt.verify, Node runtime) happens server-side afterward.
function peekUnverifiedRole(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const payloadSegment = token.split(".")[1];
    if (!payloadSegment) return null;
    const payload = JSON.parse(base64UrlDecode(payloadSegment));
    return typeof payload?.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // /admin/login must stay reachable by a logged-out admin.
  if (pathname === "/admin/login") return NextResponse.next();

  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get(TOKEN_COOKIE)?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (peekUnverifiedRole(token) !== "ADMIN") {
      // Covers both "no valid-looking role claim" and "role is CUSTOMER".
      // If this unverified peek is ever wrong in the admin's favor, the
      // server-side layout and API checks still catch it — see file header.
      return NextResponse.redirect(new URL("/account", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

// Note: /api/admin/* routes are intentionally NOT matched here — a
// redirect response would break `fetch(...).then(r => r.json())` calls
// from the admin UI. Every /api/admin/* route instead calls
// requireAdmin(req) itself (see lib/auth.ts), which verifies the JWT
// server-side and returns a proper 401/403 JSON error, never relying on
// hiding UI buttons for protection.

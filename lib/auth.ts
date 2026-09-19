import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  TOKEN_COOKIE,
  AuthTokenPayload,
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  UnauthorizedError,
  ForbiddenError,
} from "./auth-core";

// Next-bound auth helpers. The framework-independent primitives
// (password hashing, JWT sign/verify, error classes) live in
// lib/auth-core.ts so they can also be used from prisma/seed.ts, which
// runs as a plain Node script outside any Next.js request context.
// Every existing `import { ... } from "@/lib/auth"` across the app keeps
// working unchanged via these re-exports.
export {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  UnauthorizedError,
  ForbiddenError,
};
export type { AuthTokenPayload };

// ---- Request helpers --------------------------------------------------

export function getAuthUser(req: NextRequest): AuthTokenPayload | null {
  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(req: NextRequest): AuthTokenPayload {
  const user = getAuthUser(req);
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}

export function requireAdmin(req: NextRequest): AuthTokenPayload {
  const user = requireAuth(req);
  if (user.role !== "ADMIN") {
    throw new ForbiddenError();
  }
  return user;
}

export const AUTH_COOKIE_NAME = TOKEN_COOKIE;

// ---- Server Component helper -------------------------------------------
// Server Components / layouts don't receive a NextRequest, only the
// read-only cookies() store from next/headers. Used by pages that need
// to know the logged-in user before rendering (account, cart, checkout,
// wishlist, admin) without an extra network round-trip to an API route.
export function getServerAuthUser(): AuthTokenPayload | null {
  const token = cookies().get(TOKEN_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

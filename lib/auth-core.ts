import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// This file intentionally has NO "next/server" or "next/headers" imports.
// lib/auth.ts (the Next-bound request/cookie helpers) re-exports
// everything here, so every existing `import { ... } from "@/lib/auth"`
// keeps working unchanged. The split exists so prisma/seed.ts — a plain
// Node script run via `tsx`, outside any Next.js request context — can
// hash the admin password with the exact same bcrypt logic the app uses
// at login, instead of duplicating (and risking drift in) that logic.

const JWT_SECRET = process.env.JWT_SECRET as string;
export const TOKEN_COOKIE = "ss_token";
const TOKEN_EXPIRY = "7d";

export interface AuthTokenPayload {
  userId: number;
  role: "CUSTOMER" | "ADMIN";
  email: string;
}

// ---- Passwords ----------------------------------------------------------

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ---- JWT ------------------------------------------------------------------

export function signToken(payload: AuthTokenPayload): string {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not set in the environment");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    if (!JWT_SECRET) throw new Error("JWT_SECRET is not set in the environment");
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

// ---- Errors -----------------------------------------------------------

export class UnauthorizedError extends Error {
  status = 401;
  constructor(message = "Not authenticated") {
    super(message);
  }
}

export class ForbiddenError extends Error {
  status = 403;
  constructor(message = "Not authorized") {
    super(message);
  }
}

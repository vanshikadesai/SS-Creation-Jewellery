"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid email or password");
        return;
      }
      // This is the shared customer-facing login; an admin account can
      // still authenticate here (same API), but should land in the admin
      // dashboard rather than the customer account page.
      router.push(data.user.role === "ADMIN" ? "/admin/dashboard" : redirectTo);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl text-center mb-8">Sign In</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wide2 text-charcoal/60 mb-1.5">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-border bg-transparent px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide2 text-charcoal/60 mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border bg-transparent px-3 py-2.5 text-sm"
          />
        </div>

        <div className="text-right">
          <Link href="/forgot-password" className="text-xs text-champagne-dark hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && <p className="text-sm text-rosedust">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="text-center text-sm text-charcoal/60 mt-8">
        New to SS Creation?{" "}
        <Link href="/register" className="text-champagne-dark hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

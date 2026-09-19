"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginForm() {
  const router = useRouter();
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

      // The shared login API authenticates any active user, customer or
      // admin. This screen is admin-only, so a valid-but-non-admin login
      // must never leave a session behind here — clear the cookie we
      // just received and reject, rather than silently redirecting a
      // customer into (or near) the admin shell.
      if (data.user.role !== "ADMIN") {
        await fetch("/api/auth/logout", { method: "POST" });
        setError("This login is for administrators only.");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image
            src="/images/logo.png"
            alt="SS Creation Jewellery"
            width={140}
            height={90}
            className="h-14 w-auto object-contain mx-auto mb-4"
          />
          <p className="eyebrow text-champagne mb-2">SS Creation Jewellery</p>
          <h1 className="text-2xl text-ivory">Admin Sign In</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-[#242220] p-8 border border-white/10">
          <div>
            <label className="block text-xs uppercase tracking-wide2 text-ivory/50 mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-white/20 bg-transparent text-ivory px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide2 text-ivory/50 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-white/20 bg-transparent text-ivory px-3 py-2.5 text-sm"
            />
          </div>

          {error && <p className="text-sm text-rosedust">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-champagne text-charcoal text-xs uppercase tracking-wide2 py-3 hover:bg-champagne-dark transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-ivory/40 mt-6">
          Customer? Use the{" "}
          <a href="/login" className="text-champagne hover:underline">
            regular sign in
          </a>{" "}
          instead.
        </p>
      </div>
    </div>
  );
}

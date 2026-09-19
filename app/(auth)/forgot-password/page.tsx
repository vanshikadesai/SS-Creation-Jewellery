"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("done");
      setMessage(data.message);
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl text-center mb-3">Forgot Password</h1>
      <p className="text-sm text-charcoal/60 text-center mb-8">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      {status === "done" ? (
        <div className="border border-emerald/40 bg-emerald/5 text-sm text-charcoal p-4 text-center">
          {message}
        </div>
      ) : (
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

          {status === "error" && <p className="text-sm text-rosedust">{message}</p>}

          <button type="submit" disabled={status === "loading"} className="btn-primary w-full">
            {status === "loading" ? "Sending…" : "Send Reset Link"}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-charcoal/60 mt-8">
        <Link href="/login" className="text-champagne-dark hover:underline">
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}

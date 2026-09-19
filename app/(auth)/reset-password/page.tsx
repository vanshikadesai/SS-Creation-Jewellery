"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong.");
        return;
      }
      setStatus("done");
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-rosedust mb-6">
          This reset link is missing or invalid.
        </p>
        <Link href="/forgot-password" className="btn-primary">
          Request a New Link
        </Link>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="border border-emerald/40 bg-emerald/5 text-sm text-charcoal p-4 text-center">
        Password updated. Redirecting you to sign in…
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl text-center mb-8">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wide2 text-charcoal/60 mb-1.5">
            New Password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border bg-transparent px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide2 text-charcoal/60 mb-1.5">
            Confirm New Password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-border bg-transparent px-3 py-2.5 text-sm"
          />
        </div>

        {status === "error" && <p className="text-sm text-rosedust">{message}</p>}

        <button type="submit" disabled={status === "loading"} className="btn-primary w-full">
          {status === "loading" ? "Updating…" : "Update Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create your account");
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div>
      <h1 className="text-2xl md:text-3xl text-center mb-8">Create Account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wide2 text-charcoal/60 mb-1.5">
            Full Name
          </label>
          <input
            required
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            className="w-full border border-border bg-transparent px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide2 text-charcoal/60 mb-1.5">
            Email
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full border border-border bg-transparent px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide2 text-charcoal/60 mb-1.5">
            Mobile Number
          </label>
          <input
            required
            pattern="[0-9]{10}"
            title="10-digit mobile number"
            value={form.mobile}
            onChange={(e) => update("mobile", e.target.value)}
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
            minLength={8}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="w-full border border-border bg-transparent px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide2 text-charcoal/60 mb-1.5">
            Confirm Password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={form.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            className="w-full border border-border bg-transparent px-3 py-2.5 text-sm"
          />
        </div>

        {error && <p className="text-sm text-rosedust">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-charcoal/60 mt-8">
        Already have an account?{" "}
        <Link href="/login" className="text-champagne-dark hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", mobile: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("done");
      setMessage(data.message);
      setForm({ name: "", email: "", mobile: "", message: "" });
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (status === "done") {
    return (
      <div className="border border-emerald/40 bg-emerald/5 text-sm text-charcoal p-6 text-center">
        {message}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs uppercase tracking-wide2 text-charcoal/60 mb-1.5">
          Name
        </label>
        <input
          required
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
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
          Mobile (optional)
        </label>
        <input
          pattern="[0-9]{10}"
          title="10-digit mobile number"
          value={form.mobile}
          onChange={(e) => update("mobile", e.target.value)}
          className="w-full border border-border bg-transparent px-3 py-2.5 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wide2 text-charcoal/60 mb-1.5">
          Message
        </label>
        <textarea
          required
          minLength={10}
          rows={5}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className="w-full border border-border bg-transparent px-3 py-2.5 text-sm resize-none"
        />
      </div>

      {status === "error" && <p className="text-sm text-rosedust">{message}</p>}

      <button type="submit" disabled={status === "loading"} className="btn-primary w-full sm:w-auto">
        {status === "loading" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={logout}
      disabled={busy}
      className="flex items-center gap-2 text-sm text-ivory/70 hover:text-ivory transition-colors"
    >
      <LogOut size={15} />
      {busy ? "Logging out…" : "Logout"}
    </button>
  );
}

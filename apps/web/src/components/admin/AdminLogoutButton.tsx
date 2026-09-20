"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { logoutAdmin } from "@/api/client";

export function AdminLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    try {
      setBusy(true);
      await logoutAdmin();
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      className="admin-session-bar__logout"
      type="button"
      disabled={busy}
      onClick={() => void handleLogout()}
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}

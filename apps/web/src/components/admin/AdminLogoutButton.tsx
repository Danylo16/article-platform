"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { logoutAdmin } from "@/api/client";

export function AdminLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    const hasUnsavedChanges = document.querySelector(
      '[data-editor-dirty="true"]',
    );

    if (
      hasUnsavedChanges &&
      !window.confirm("Є незбережені зміни. Вийти без збереження?")
    ) {
      return;
    }

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
      {busy ? "Виходимо…" : "Вийти"}
    </button>
  );
}

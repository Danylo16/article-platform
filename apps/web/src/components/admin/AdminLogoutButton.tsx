"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutAdmin } from "@/api/client";

export function AdminLogoutButton() {
  const router = useRouter();
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  async function handleLogout() {
    if (pending.current) return;
    if (document.querySelector('[data-editor-dirty="true"]') &&
      !window.confirm("Є незбережені зміни. Вийти без збереження?")) return;
    pending.current = true;
    setBusy(true);
    setError(false);
    try {
      await logoutAdmin();
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setError(true);
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <div className="admin-logout">
      <button className="admin-button admin-button--secondary" type="button" disabled={busy}
        aria-busy={busy} onClick={() => void handleLogout()}>{busy ? "Виходимо…" : "Вийти"}</button>
      {error && <p className="admin-logout__error" role="alert">
        Не вдалося вийти. Перевірте з’єднання та натисніть «Вийти» ще раз.
      </p>}
    </div>
  );
}

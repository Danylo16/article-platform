"use client";
import { useRef, useState } from "react";
import { uploadMedia } from "../../api/client";
import { getMediaUrl } from "../../api/media";
import { validateImageUpload } from "../../lib/image-upload";

export function AuthorPhotoUpload({ value, onChange, disabled, onBusy }: {
  value: string; onChange: (url: string) => void; disabled?: boolean; onBusy: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const locked = useRef(false);
  return <div className="author-photo-upload">
    {value && <img src={getMediaUrl(value) ?? ""} alt="Попередній перегляд аватара" />}
    <label>Фото автора — JPEG, PNG, WebP до 10 МБ
      <input type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled || busy} onChange={async (event) => {
        const file = event.currentTarget.files?.[0]; event.currentTarget.value = "";
        if (!file || locked.current) return;
        locked.current = true; setBusy(true); onBusy(true); setError("");
        try { await validateImageUpload(file); const result = await uploadMedia(file); onChange(result.url); }
        catch (error) { setError(error instanceof Error ? error.message : "Не вдалося завантажити фото."); }
        finally { locked.current = false; setBusy(false); onBusy(false); }
      }} />
    </label>
    {busy && <p role="status">Завантаження фото…</p>}
    {value && <button type="button" disabled={busy || disabled} onClick={() => onChange("")}>Прибрати фото</button>}
    <small>Фото буде опубліковане після збереження автора.</small>
    {error && <p role="alert">{error}</p>}
  </div>;
}

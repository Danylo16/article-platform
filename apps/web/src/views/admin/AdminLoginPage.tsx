"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { loginAdmin } from "@/api/client";

export function AdminLoginPage({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      setBusy(true);
      await loginAdmin({ email, password });
      router.replace(nextPath);
      router.refresh();
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Не вдалося увійти",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-login">
      <section className="admin-login__panel">
        <div className="admin-login__identity">
          <p className="admin-login__eyebrow">DORIDA</p>
          <h1>Редакційна панель</h1>
          <p>Увійди</p>
        </div>

        <form className="admin-login__form" onSubmit={handleSubmit}>
          <label>
            <span>Електронна пошта</span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label>
            <span>Пароль</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && (
            <p className="admin-login__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy}>
            {busy ? "Входимо…" : "Увійти"}
          </button>
        </form>
      </section>
    </main>
  );
}

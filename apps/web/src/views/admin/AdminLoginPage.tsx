"use client";

import Link from "next/link";
import { type FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { loginAdmin } from "@/api/client";

export function AdminLoginPage({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const pending = useRef(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true;
    setError(null);

    try {
      setBusy(true);
      await loginAdmin({ email: email.trim(), password });
      router.replace(nextPath);
      router.refresh();
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : "";
      const knownMessages = [
        "Неправильна електронна пошта або пароль",
        "Забагато спроб входу. Спробуйте пізніше.",
      ];
      setError(knownMessages.includes(message)
        ? message
        : "Не вдалося увійти. Перевірте з’єднання та спробуйте ще раз.");
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <main className="admin-login">
      <section className="admin-login__panel" aria-labelledby="admin-login-title">
        <div className="admin-login__identity">
          <p className="admin-login__eyebrow">DORIDA</p>
          <h1 id="admin-login-title">Редакційна панель</h1>
          <p>Увійдіть, щоб працювати з матеріалами.</p>
        </div>

        <form className="admin-login__form" onSubmit={handleSubmit} aria-busy={busy} aria-describedby={error ? "admin-login-error" : undefined}>
          <label>
            <span>Електронна пошта</span>
            <input
              name="email"
              autoCapitalize="none"
              spellCheck={false}
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
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && (
            <p id="admin-login-error" className="admin-login__error" role="alert">
              {error}
            </p>
          )}

          <button className="admin-login__submit" type="submit" disabled={busy}>
            {busy ? "Входимо…" : "Увійти"}
          </button>
          <Link className="admin-login__back" href="/">Повернутися на сайт</Link>
        </form>
      </section>
    </main>
  );
}

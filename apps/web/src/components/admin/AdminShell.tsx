"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminLogoutButton } from "./AdminLogoutButton";

const navigation = [
  { href: "/admin/articles", label: "Статті", description: "Написання та публікація" },
  { href: "/admin/content", label: "Довідники", description: "Автори, рубрики й теги" },
  { href: "/admin/sections", label: "Розділи", description: "Навігація сайту" },
  { href: "/admin/places", label: "Місця", description: "Карта й адреси" },
] as const;

export function AdminShell({ adminEmail, children }: { adminEmail: string; children: ReactNode }) {
  const pathname = usePathname();
  const current = navigation.find(({ href }) => pathname === href || pathname.startsWith(`${href}/`));
  const pageLabel = pathname === "/admin/articles/new" ? "Нова стаття"
    : pathname.startsWith("/admin/articles/") ? "Редагування статті" : current?.label ?? "Редакція";
  return (
    <div className="admin-area">
      <button className="admin-skip-link" type="button" onClick={() => {
        // A button avoids triggering the editor's link navigation guard.
        const content = document.getElementById("admin-content");
        content?.focus();
        content?.scrollIntoView({ block: "start" });
      }}>Перейти до вмісту</button>
      <aside className="admin-sidebar" aria-label="Редакційний простір">
        <Link className="admin-sidebar__identity" href="/admin/articles">
          <strong>DORIDA<span aria-hidden="true"> / </span></strong><span>Редакція</span>
        </Link>
        <nav className="admin-sidebar__nav" aria-label="Навігація редакції">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} aria-current={current?.href === item.href ? "page" : undefined}>
              <span>{item.label}</span><small>{item.description}</small>
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar__footer"><span>Редакційний простір</span><p>Матеріали, люди та місця DORIDA.</p></div>
      </aside>
      <div className="admin-workspace">
        <header className="admin-utility">
          <span className="admin-utility__location">{pageLabel}</span>
          <div className="admin-utility__actions">
            <Link href="/" target="_blank" rel="noreferrer" aria-label="Відкрити сайт у новій вкладці">Відкрити сайт <span aria-hidden="true">↗</span></Link>
            <span className="admin-utility__account" title={adminEmail}>{adminEmail}</span>
            <AdminLogoutButton />
          </div>
        </header>
        <div id="admin-content" className="admin-content" tabIndex={-1}>{children}</div>
      </div>
    </div>
  );
}

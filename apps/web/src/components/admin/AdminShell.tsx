"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { AdminLogoutButton } from "./AdminLogoutButton";

type AdminShellProps = {
  adminEmail: string;
  children: ReactNode;
};

const navigation = [
  {
    href: "/admin/articles",
    label: "Статті",
    description: "Створення й публікація",
  },
  {
    href: "/admin/content",
    label: "Довідники",
    description: "Автори, рубрики й теги",
  },
  {
    href: "/admin/sections",
    label: "Розділи",
    description: "Меню публічного сайту",
  },
  {
    href: "/admin/places",
    label: "Місця",
    description: "Карта, адреси й типи",
  },
] as const;

export function AdminShell({ adminEmail, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="admin-area">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__identity">
          <Link href="/admin/articles" aria-label="Головна сторінка DORIDA CMS">
            <strong>DORIDA</strong>
            <span>Редакційна CMS</span>
          </Link>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Навігація CMS">
          {navigation.map((item) => {
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
              >
                <span>{item.label}</span>
                <small>{item.description}</small>
              </Link>
            );
          })}
        </nav>

        <Link className="admin-sidebar__new" href="/admin/articles/new">
          <span aria-hidden="true">＋</span>
          Нова стаття
        </Link>

        <div className="admin-sidebar__footer">
          <Link
            className="admin-sidebar__public-link"
            href="/"
            target="_blank"
            rel="noreferrer"
          >
            Відкрити сайт
            <span aria-hidden="true">↗</span>
          </Link>

          <div className="admin-sidebar__account">
            <span>Ви увійшли як</span>
            <strong title={adminEmail}>{adminEmail}</strong>
            <AdminLogoutButton />
          </div>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-mobile-header">
          <Link href="/admin/articles">DORIDA CMS</Link>
          <div>
            <Link href="/admin/articles/new">Нова стаття</Link>
            <AdminLogoutButton />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

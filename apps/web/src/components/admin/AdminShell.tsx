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
    label: "Articles",
    description: "Write and publish",
  },
  {
    href: "/admin/content",
    label: "Content data",
    description: "Authors, categories, tags",
  },
] as const;

export function AdminShell({ adminEmail, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="admin-area">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__identity">
          <Link href="/admin/articles" aria-label="DORIDA CMS home">
            <strong>DORIDA</strong>
            <span>Editorial CMS</span>
          </Link>
        </div>

        <nav className="admin-sidebar__nav" aria-label="CMS navigation">
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
          New article
        </Link>

        <div className="admin-sidebar__footer">
          <Link
            className="admin-sidebar__public-link"
            href="/"
            target="_blank"
            rel="noreferrer"
          >
            View publication
            <span aria-hidden="true">↗</span>
          </Link>

          <div className="admin-sidebar__account">
            <span>Signed in as</span>
            <strong title={adminEmail}>{adminEmail}</strong>
            <AdminLogoutButton />
          </div>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-mobile-header">
          <Link href="/admin/articles">DORIDA CMS</Link>
          <div>
            <Link href="/admin/articles/new">New article</Link>
            <AdminLogoutButton />
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

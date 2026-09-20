import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthenticatedAdmin } from "@/api/admin-server";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-area">
      <header className="admin-session-bar">
        <Link className="admin-session-bar__brand" href="/admin/articles">
          DORIDA CMS
        </Link>

        <div className="admin-session-bar__account">
          <span>{admin.email}</span>
          <AdminLogoutButton />
        </div>
      </header>

      {children}
    </div>
  );
}

import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getAuthenticatedAdmin } from "@/api/admin-server";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await getAuthenticatedAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return <AdminShell adminEmail={admin.email}>{children}</AdminShell>;
}

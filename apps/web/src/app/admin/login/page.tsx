import { redirect } from "next/navigation";

import { getAuthenticatedAdmin } from "@/api/admin-server";
import { AdminLoginPage } from "@/views/admin/AdminLoginPage";

function safeNextPath(value: string | string[] | undefined): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/admin/") ||
    value.startsWith("//") ||
    value === "/admin/login"
  ) {
    return "/admin/articles";
  }

  return value;
}

export default async function AdminLoginRoute({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const admin = await getAuthenticatedAdmin();
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);

  if (admin) {
    redirect(nextPath);
  }

  return <AdminLoginPage nextPath={nextPath} />;
}

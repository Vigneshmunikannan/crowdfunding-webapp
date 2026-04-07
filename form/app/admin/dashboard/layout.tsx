import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/auth";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ok = await isAdminSession();
  if (!ok) {
    redirect("/admin/login");
  }
  return <>{children}</>;
}

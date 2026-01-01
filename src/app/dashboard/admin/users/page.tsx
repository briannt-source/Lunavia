import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminUsersClientPage from "./client-page";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const role = (session.user as any)?.role;
  const adminRole = role?.startsWith("ADMIN_")
    ? role.replace("ADMIN_", "")
    : role;

  // Only SUPER_ADMIN can access this page
  if (adminRole !== "SUPER_ADMIN") {
    redirect("/dashboard/admin");
  }

  return <AdminUsersClientPage />;
}



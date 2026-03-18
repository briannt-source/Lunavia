import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import AdminToursClientPage from "./client-page";

export default async function AdminToursPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const role = (session.user as any)?.role;
  const adminRole = role?.startsWith("ADMIN_")
    ? role.replace("ADMIN_", "")
    : role;

  // Only MODERATOR and SUPER_ADMIN can access
  const isModerator = adminRole === "MODERATOR" || adminRole === "SUPER_ADMIN";
  if (!isModerator) {
    redirect("/dashboard/admin");
  }

  return <AdminToursClientPage />;
}



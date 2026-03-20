import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR", "OPS_CS", "FINANCE", "FINANCE_LEAD", "SUPPORT_STAFF"];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const role = (session.user as any).role as string;

  // Redirect based on role
  if (role === "TOUR_OPERATOR" || role === "TOUR_AGENCY") {
    redirect("/dashboard/operator");
  } else if (role === "TOUR_GUIDE") {
    redirect("/dashboard/guide");
  } else if (role?.startsWith("ADMIN_") || ADMIN_ROLES.includes(role)) {
    redirect("/dashboard/admin");
  } else {
    // Fallback: send to signin instead of "/" to prevent redirect loop
    redirect("/auth/signin");
  }
}


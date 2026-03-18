import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const role = session.user.role;

  // Redirect based on role
  if (role === "TOUR_OPERATOR" || role === "TOUR_AGENCY") {
    redirect("/dashboard/operator");
  } else if (role === "TOUR_GUIDE") {
    redirect("/dashboard/guide");
  } else {
    redirect("/");
  }
}


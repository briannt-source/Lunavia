export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import LunaviaWelcomePage from "@/components/stitch/lunavia-welcome-page";

export default async function Home() {
  let session = null;

  try {
    session = await getServerSession(authOptions);
  } catch {
    session = null;
  }

  if (session) {
    redirect("/dashboard");
  }

  return <LunaviaWelcomePage />;
}

"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR", "OPS_CS", "FINANCE", "FINANCE_LEAD", "SUPPORT_STAFF"];

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) return;
    
    if (status === "loading") return;
    
    if (!session) {
      hasRedirected.current = true;
      router.replace("/auth/signin");
      return;
    }

    const role = (session.user as any)?.role;
    
    if (!role) {
      hasRedirected.current = true;
      router.replace("/auth/signin");
      return;
    }
    
    hasRedirected.current = true;
    
    // Redirect to role-specific dashboard
    if (role === "TOUR_OPERATOR" || role === "TOUR_AGENCY") {
      router.replace("/dashboard/operator");
    } else if (role === "TOUR_GUIDE") {
      router.replace("/dashboard/guide");
    } else if (role?.startsWith("ADMIN_") || ADMIN_ROLES.includes(role)) {
      router.replace("/dashboard/admin");
    } else {
      // Unknown role — let middleware handle via /dashboard
      router.replace("/dashboard");
    }
  }, [session, status, router, pathname]);

  return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lunavia-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Redirecting...</p>
        </div>
      </div>
  );
}



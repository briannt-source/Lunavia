"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

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
    if (role?.startsWith("ADMIN_") || role === "SUPER_ADMIN" || role === "MODERATOR" || role === "SUPPORT_STAFF") {
      router.replace("/dashboard/admin");
    } else if (role === "TOUR_OPERATOR" || role === "TOUR_AGENCY") {
      router.replace("/dashboard/operator");
    } else if (role === "TOUR_GUIDE") {
      router.replace("/dashboard/guide");
    } else {
      router.replace("/dashboard");
    }
  }, [session, status, router, pathname]);

  return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Đang chuyển hướng...</p>
        </div>
      </div>
  );
}


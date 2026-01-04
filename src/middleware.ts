import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-config";

export default withAuth(
  function middleware(req) {
  const token = req.nextauth.token;
  const path = req.nextUrl.pathname;

  // 🔒 Chưa login → về /auth/signin
  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  const role = token.role as string | undefined;

  // ⚠️ Không có role → logout
  if (!role) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  // ❌ Guide không được tạo tour
  if (path.startsWith("/tours/create") && role === "TOUR_GUIDE") {
    return NextResponse.redirect(
      new URL("/dashboard/guide?error=unauthorized", req.url)
    );
  }

  // 🧭 Operator / Agency
  if (path.startsWith("/dashboard/operator")) {
    if (role !== "TOUR_OPERATOR" && role !== "TOUR_AGENCY") {
      return NextResponse.redirect(new URL("/dashboard/guide", req.url));
    }
  }

  // 🧭 Guide
  if (path.startsWith("/dashboard/guide")) {
    if (role !== "TOUR_GUIDE") {
      return NextResponse.redirect(new URL("/dashboard/operator", req.url));
    }
  }

  // 🛡️ Admin - check if user is admin
  if (path.startsWith("/dashboard/admin")) {
    // Check if role starts with ADMIN_ or is a valid admin role
    if (role && (role.startsWith("ADMIN_") || role === "SUPER_ADMIN" || role === "MODERATOR" || role === "SUPPORT_STAFF")) {
      return NextResponse.next();
    }
    // If not admin, redirect to appropriate dashboard
    if (role === "TOUR_OPERATOR" || role === "TOUR_AGENCY") {
      return NextResponse.redirect(new URL("/dashboard/operator", req.url));
    } else if (role === "TOUR_GUIDE") {
      return NextResponse.redirect(new URL("/dashboard/guide", req.url));
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tours/create/:path*",
    "/chat/:path*",
    "/ai/:path*",
  ],
};

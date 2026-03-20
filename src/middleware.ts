import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import createMiddleware from 'next-intl/middleware';
import { routing } from './navigation';

const intlMiddleware = createMiddleware(routing);

const ADMIN_ROLES = ["SUPER_ADMIN", "MODERATOR", "OPS_CS", "FINANCE", "FINANCE_LEAD", "SUPPORT_STAFF"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static assets and internal APIs
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET });
  const segments = pathname.split('/').filter(Boolean);
  const hasLocale = segments.length > 0 && ['en', 'vi'].includes(segments[0]);
  
  let routeWithoutLocale = pathname;
  if (hasLocale) {
    routeWithoutLocale = pathname.replace(`/${segments[0]}`, '');
  }
  if (routeWithoutLocale === '') {
    routeWithoutLocale = '/';
  }

  const localePrefix = hasLocale ? `/${segments[0]}` : `/${routing.defaultLocale}`;

  // 1. Unauthenticated users -> redirect to login
  const isProtectedPath = routeWithoutLocale.startsWith("/dashboard");

  if (isProtectedPath && !token) {
    const loginUrl = new URL(`${localePrefix}/auth/signin`, req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Authenticated user on bare /dashboard → redirect to role-specific dashboard
  if (isProtectedPath && token) {
    const role = token.role as string | undefined;

    if (!role) {
      return NextResponse.redirect(new URL(`${localePrefix}/auth/signin`, req.url));
    }

    // Handle bare /dashboard (no role suffix) — redirect immediately based on role
    if (routeWithoutLocale === "/dashboard" || routeWithoutLocale === "/dashboard/") {
      if (role === "TOUR_OPERATOR" || role === "TOUR_AGENCY") {
        return NextResponse.redirect(new URL(`${localePrefix}/dashboard/operator`, req.url));
      } else if (role === "TOUR_GUIDE") {
        return NextResponse.redirect(new URL(`${localePrefix}/dashboard/guide`, req.url));
      } else if (role.startsWith("ADMIN_") || ADMIN_ROLES.includes(role)) {
        return NextResponse.redirect(new URL(`${localePrefix}/dashboard/admin`, req.url));
      }
      // Unknown role: show signin instead of looping
      return NextResponse.redirect(new URL(`${localePrefix}/auth/signin`, req.url));
    }

    // 3. Role-based Access Control for specific dashboard sections
    if (routeWithoutLocale.startsWith("/dashboard/operator")) {
      if (role !== "TOUR_OPERATOR" && role !== "TOUR_AGENCY") {
        if (role === "TOUR_GUIDE") return NextResponse.redirect(new URL(`${localePrefix}/dashboard/guide`, req.url));
        if (role.startsWith("ADMIN_") || ADMIN_ROLES.includes(role)) return NextResponse.redirect(new URL(`${localePrefix}/dashboard/admin`, req.url));
        return NextResponse.redirect(new URL(`${localePrefix}/auth/signin`, req.url));
      }
    }

    if (routeWithoutLocale.startsWith("/dashboard/guide")) {
      if (role !== "TOUR_GUIDE") {
        if (role === "TOUR_OPERATOR" || role === "TOUR_AGENCY") return NextResponse.redirect(new URL(`${localePrefix}/dashboard/operator`, req.url));
        if (role.startsWith("ADMIN_") || ADMIN_ROLES.includes(role)) return NextResponse.redirect(new URL(`${localePrefix}/dashboard/admin`, req.url));
        return NextResponse.redirect(new URL(`${localePrefix}/auth/signin`, req.url));
      }
    }

    if (routeWithoutLocale.startsWith("/dashboard/admin")) {
      if (!role.startsWith("ADMIN_") && !ADMIN_ROLES.includes(role)) {
        if (role === "TOUR_OPERATOR" || role === "TOUR_AGENCY") return NextResponse.redirect(new URL(`${localePrefix}/dashboard/operator`, req.url));
        if (role === "TOUR_GUIDE") return NextResponse.redirect(new URL(`${localePrefix}/dashboard/guide`, req.url));
        return NextResponse.redirect(new URL(`${localePrefix}/auth/signin`, req.url));
      }
    }
  }

  // 4. Fall through to next-intl to handle URL rewriting
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};


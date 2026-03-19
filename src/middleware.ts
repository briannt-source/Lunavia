import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import createMiddleware from 'next-intl/middleware';
import { routing } from './navigation';

const intlMiddleware = createMiddleware(routing);

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

  // 2. Role-based Access Control
  if (isProtectedPath && token) {
    const role = token.role as string | undefined;

    if (!role) {
      return NextResponse.redirect(new URL(`${localePrefix}/auth/signin`, req.url));
    }



    if (routeWithoutLocale.startsWith("/dashboard/operator")) {
      if (role !== "TOUR_OPERATOR" && role !== "TOUR_AGENCY") {
        return NextResponse.redirect(new URL(`${localePrefix}/dashboard/guide`, req.url));
      }
    }

    if (routeWithoutLocale.startsWith("/dashboard/guide")) {
      if (role !== "TOUR_GUIDE") {
        return NextResponse.redirect(new URL(`${localePrefix}/dashboard/operator`, req.url));
      }
    }

    if (routeWithoutLocale.startsWith("/dashboard/admin")) {
      const validAdminRoles = ["SUPER_ADMIN", "MODERATOR", "OPS_CS", "FINANCE", "FINANCE_LEAD", "SUPPORT_STAFF"];
      if (!role.startsWith("ADMIN_") && !validAdminRoles.includes(role)) {
        if (role === "TOUR_OPERATOR" || role === "TOUR_AGENCY") return NextResponse.redirect(new URL(`${localePrefix}/dashboard/operator`, req.url));
        if (role === "TOUR_GUIDE") return NextResponse.redirect(new URL(`${localePrefix}/dashboard/guide`, req.url));
        return NextResponse.redirect(new URL(`${localePrefix}/`, req.url));
      }
    }
  }

  // 3. Fall through to next-intl to handle URL rewriting
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

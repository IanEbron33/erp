import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isMaintenanceMode =
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true' ||
    process.env.MAINTENANCE_MODE === 'true';

  const { pathname, searchParams } = request.nextUrl;

  // 1. Exclude static files, Next.js internal assets, and maintenance routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/maintenance') ||
    pathname.startsWith('/offline') ||
    pathname.includes('.') // static files like favicon.ico, images, robots.txt, etc.
  ) {
    return NextResponse.next();
  }

  // 2. Check for Admin Emergency Bypass via query parameter or cookie
  const bypassParam = searchParams.get('bypass');
  const hasBypassCookie = request.cookies.get('erp_maintenance_bypass')?.value === 'active';

  if (bypassParam === 'admin' || hasBypassCookie) {
    const response = NextResponse.next();
    // Persist bypass state for the admin session
    if (!hasBypassCookie && bypassParam === 'admin') {
      response.cookies.set('erp_maintenance_bypass', 'active', {
        path: '/',
        maxAge: 60 * 60 * 8, // 8 hours
        httpOnly: true,
        sameSite: 'lax',
      });
    }
    return response;
  }

  // 3. If Maintenance Mode is enabled, redirect incoming visitors to /maintenance
  if (isMaintenanceMode) {
    const maintenanceUrl = new URL('/maintenance', request.url);
    return NextResponse.redirect(maintenanceUrl, 307); // 307 Temporary Redirect
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

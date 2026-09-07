import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isMaintenanceMode =
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true' ||
    process.env.MAINTENANCE_MODE === 'true';

  const { pathname } = request.nextUrl;

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

  // 2. If Maintenance Mode is enabled, strictly redirect all incoming traffic to /maintenance
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

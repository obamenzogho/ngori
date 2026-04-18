import { ADMIN_SESSION_COOKIE, verifySessionToken } from '@/lib/auth-token';
import { NextRequest, NextResponse } from 'next/server';

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminLoginPage = pathname === '/admin/login';
  const isAdminPage = pathname.startsWith('/admin') && !isAdminLoginPage;
  const isAdminApi = pathname.startsWith('/api/admin');
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isAuthenticated = await verifySessionToken(token);

  if (isAdminApi && !isAuthenticated) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  if (isAdminPage && !isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isAdminLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

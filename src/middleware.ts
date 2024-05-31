import { NextRequest, NextResponse } from 'next/server';

import { updateSession } from '@/lib/auth';

const authPaths = new Set(['/login', '/register']);

export default async function middleware(request: NextRequest) {
  const { cookies, url, nextUrl } = request;
  const { pathname } = nextUrl;

  const headers = new Headers(request.headers);
  headers.set('x-current-path', nextUrl.pathname);

  const session = cookies.get('session')?.value;

  if (!session && !authPaths.has(pathname)) {
    return NextResponse.redirect(new URL('/login', url));
  }

  await updateSession(session);

  if (session && authPaths.has(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', url));
  }

  return NextResponse.next({ headers });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

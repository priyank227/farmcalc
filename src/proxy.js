import { NextResponse } from 'next/server';

export function proxy(request) {
  const session = request.cookies.get('session');
  const path = request.nextUrl.pathname;

  // Define public routes that don't require authentication
  const isPublicRoute = path === '/login' || path.startsWith('/manifest') || path.startsWith('/icon') || path === '/sw.js';

  // If user is trying to access a protected route without a session
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is already logged in and tries to access the login page
  if (session && path === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except standard internal next.js files
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Cek token dari cookies atau localStorage tidak bisa diakses di middleware
  // Kita akan cek di sisi client untuk route protection
  // Middleware ini bisa digunakan untuk server-side protection
  
  const token = request.cookies.get('token')?.value;
  
  // Jika mengakses halaman yang membutuhkan auth dan tidak ada token, redirect ke login
  const protectedPaths = ['/home', '/dashboard'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
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
     * - login
     * - register
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|register).*)',
  ],
};
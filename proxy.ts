import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js Middleware - Server-side route protection
 *
 * Runs BEFORE page render to:
 * - Redirect unauthenticated users from protected routes
 * - Redirect authenticated users away from auth pages
 *
 * Note: This middleware uses refresh_token cookie to check auth.
 * The actual access token is managed in memory (Zustand store).
 */

// Routes that require authentication
const PROTECTED_ROUTES = ['/admin']

// Auth routes (login, signup, etc.) - redirect away if already logged in
const AUTH_ROUTES = ['/auth/login', '/auth/signup', '/auth/forgot-password']

// Public routes that don't need any checks
const PUBLIC_ROUTES = [
  '/',
  '/contact',
  '/auth/reset-password',
  '/auth/setup-password',
  '/auth/verify-email',
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get refreshToken cookie (httpOnly cookie set by backend)
  const refreshToken = request.cookies.get('refreshToken')?.value
  const hasAuth = !!refreshToken

  // Check if current route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

  // 1. Protected route without auth → redirect to login
  if (isProtectedRoute && !hasAuth) {
    const loginUrl = new URL('/auth/login', request.url)
    // Preserve the intended destination for redirect after login
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 2. Auth route with existing auth → redirect to admin
  if (isAuthRoute && hasAuth) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // 3. Allow all other requests
  return NextResponse.next()
}

export const config = {
  /*
   * Match all routes except:
   * - API routes
   * - Static files
   * - Next.js internals
   */
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

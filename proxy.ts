import createMiddleware from 'next-intl/middleware'
import { routing } from '@/src/i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Static files
  // - _next paths
  matcher: ['/', '/(vi|en)/:path*', '/((?!api|_next|.*\\..*).*)'],
}

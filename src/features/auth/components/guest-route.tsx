'use client'

import { type ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/src/hooks/use-auth'

interface GuestRouteProps {
  children: ReactNode
  redirectTo?: string
}

/**
 * Route guard for guest-only pages (login, signup, etc.)
 * Redirects authenticated users to the specified route (default: /admin/dashboard)
 */
export function GuestRoute({ children, redirectTo = '/admin/dashboard' }: GuestRouteProps) {
  const router = useRouter()
  const { authStatus } = useAuth()

  useEffect(() => {
    if (authStatus === 'authenticated') {
      router.replace(redirectTo)
    }
  }, [authStatus, redirectTo, router])

  if (authStatus === 'unknown') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600 dark:text-emerald-400" />
      </div>
    )
  }

  if (authStatus === 'authenticated') return null

  return <>{children}</>
}

'use client'

import { type ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = '/auth/login' }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, isHydrated, isLoadingProfile } = useAuth()

  useEffect(() => {
    if (isHydrated && !isAuthenticated && !isLoadingProfile) {
      router.replace(redirectTo)
    }
  }, [isAuthenticated, isHydrated, isLoadingProfile, redirectTo, router])

  if (!isHydrated || isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600 dark:text-emerald-400" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return <>{children}</>
}

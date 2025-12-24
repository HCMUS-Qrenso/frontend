'use client'

import { type ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/src/features/auth/hooks'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
}

export function ProtectedRoute({ children, redirectTo = '/auth/login' }: ProtectedRouteProps) {
  const router = useRouter()
  const { authStatus } = useAuth()

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
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

  if (authStatus === 'unauthenticated') return null

  return <>{children}</>
}

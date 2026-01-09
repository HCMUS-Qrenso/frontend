'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useRouter } from '@/src/i18n/navigation'
import { useOnboardingQuery } from '@/src/features/admin/onboarding/queries'

interface OnboardingGuardProps {
  children: React.ReactNode
}

/**
 * Guard component that redirects to onboarding wizard if not completed.
 * Wraps admin pages (except the onboarding page itself).
 */
export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { data, isLoading, isError } = useOnboardingQuery()

  // Skip check if already on onboarding page
  const isOnboardingPage = pathname.includes('/admin/onboarding')

  useEffect(() => {
    if (isOnboardingPage) return
    if (isLoading) return
    if (isError) return // Don't block on error, let user proceed

    // If onboarding not completed, redirect
    if (data?.data && !data.data.completed) {
      console.log('[OnboardingGuard] 🔄 Redirecting to onboarding wizard')
      router.replace('/admin/onboarding')
    }
  }, [data, isLoading, isError, isOnboardingPage, router])

  // Show loading while checking onboarding status
  if (!isOnboardingPage && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If not completed and not on onboarding page, don't render children yet
  if (!isOnboardingPage && data?.data && !data.data.completed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <>{children}</>
}

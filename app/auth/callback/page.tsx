'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'
import { isAxiosError } from 'axios'
import { AuthContainer } from '@/components/auth/auth-container'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth-store'
import { authApi } from '@/lib/api/auth'
import type { ApiErrorResponse } from '@/types/auth'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setToken, setUser, clearAuth } = useAuthStore()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const accessToken = searchParams.get('accessToken')

    if (!accessToken) {
      setStatus('error')
      setError('Không nhận được token từ Google. Vui lòng thử lại.')
      return
    }

    const handleOAuth = async () => {
      try {
        setToken(accessToken)
        const profile = await authApi.getProfile()
        setUser(profile)
        router.replace('/admin/dashboard')
      } catch (err) {
        clearAuth()
        setError(getErrorMessage(err))
        setStatus('error')
      }
    }

    handleOAuth()
  }, [clearAuth, router, searchParams, setToken, setUser])

  const getErrorMessage = (err: unknown) => {
    if (isAxiosError<ApiErrorResponse>(err)) {
      const data = err.response?.data
      if (data?.message) {
        return Array.isArray(data.message) ? data.message.join(', ') : data.message
      }
    }
    return 'Không thể hoàn tất đăng nhập. Vui lòng thử lại.'
  }

  return (
    <AuthContainer>
      <div className="mx-auto w-full max-w-sm space-y-6 py-10 text-center">
        {status === 'loading' ? (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-600 dark:text-emerald-400" />
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                Đang hoàn tất đăng nhập Google
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Vui lòng đợi trong giây lát...
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                Đăng nhập Google thất bại
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {error || 'Không thể hoàn tất đăng nhập. Vui lòng thử lại.'}
              </p>
            </div>
            <Button
              className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
              onClick={() => router.replace('/auth/login')}
            >
              Quay lại đăng nhập
            </Button>
          </>
        )}
      </div>
    </AuthContainer>
  )
}

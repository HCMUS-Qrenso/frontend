'use client'

/**
 * Error Boundary for Admin routes
 *
 * Provides admin-specific error handling with navigation to dashboard.
 */

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, LayoutDashboard, ArrowLeft } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { useRouter } from 'next/navigation'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminError({ error, reset }: ErrorProps) {
  const router = useRouter()

  useEffect(() => {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Admin Error:', error)
    }

    // TODO: Log to error monitoring service
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      {/* Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-500/10">
        <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
      </div>

      {/* Title */}
      <h1 className="mb-3 text-2xl font-bold text-slate-900 dark:text-white">
        Không thể tải trang
      </h1>

      {/* Message */}
      <p className="mb-8 max-w-md text-slate-500 dark:text-slate-400">
        Đã xảy ra lỗi khi tải trang quản trị. Vui lòng thử lại hoặc quay về trang tổng quan.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} className="gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700">
          <RefreshCw className="h-4 w-4" />
          Thử lại
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push('/admin')}
          className="gap-2 rounded-full"
        >
          <LayoutDashboard className="h-4 w-4" />
          Về tổng quan
        </Button>
        <Button variant="ghost" onClick={() => router.back()} className="gap-2 rounded-full">
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>
      </div>

      {/* Error Details (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-12 w-full max-w-2xl text-left">
          <details className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <summary className="cursor-pointer text-sm font-medium text-red-700 dark:text-red-400">
              Chi tiết lỗi (Development)
            </summary>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-red-700 dark:text-red-400">
                <strong>Message:</strong> {error.message}
              </p>
              {error.digest && (
                <p className="text-sm text-red-700 dark:text-red-400">
                  <strong>Digest:</strong> {error.digest}
                </p>
              )}
              {error.stack && (
                <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs whitespace-pre-wrap text-slate-100">
                  {error.stack}
                </pre>
              )}
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

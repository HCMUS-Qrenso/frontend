'use client'

/**
 * Next.js Global Error Boundary
 *
 * This file handles errors in the root layout and is the last resort
 * error boundary. It must include its own <html> and <body> tags because
 * it replaces the root layout when triggered.
 *
 * This catches errors that error.tsx cannot catch (e.g., root layout errors).
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling#handling-errors-in-root-layouts
 */

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to console
    console.error('Global Error:', error)

    // TODO: Log to error monitoring service (Sentry, etc.)
  }, [error])

  return (
    <html lang="vi">
      <body className="bg-slate-50 dark:bg-slate-950">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          {/* Icon */}
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
            <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
          </div>

          {/* Title */}
          <h1 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">Lỗi hệ thống</h1>

          {/* Message */}
          <p className="mb-8 max-w-lg text-lg text-slate-600 dark:text-slate-400">
            Đã xảy ra lỗi nghiêm trọng. Vui lòng tải lại trang hoặc liên hệ hỗ trợ nếu lỗi vẫn tiếp
            tục.
          </p>

          {/* Retry Button */}
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none"
          >
            <RefreshCw className="h-4 w-4" />
            Tải lại trang
          </button>

          {/* Error Details (Development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-12 w-full max-w-2xl text-left">
              <details className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <summary className="cursor-pointer text-sm font-medium text-red-700 dark:text-red-400">
                  Chi tiết lỗi (Development)
                </summary>
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    <strong>Name:</strong> {error.name}
                  </p>
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
      </body>
    </html>
  )
}

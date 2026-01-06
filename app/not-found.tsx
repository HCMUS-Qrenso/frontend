'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin', 'vietnamese'] })

/**
 * Global Not Found page (outside locale context)
 * This handles 404 errors that occur at the root level,
 * before the [locale] segment is matched.
 * 
 * IMPORTANT: This component includes its own html/body tags because
 * it renders outside the locale layout which normally provides them.
 */
export default function GlobalNotFound() {
  const router = useRouter()

  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`font-sans antialiased ${inter.className}`}>
        <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-16 dark:bg-slate-950">
          <div className="flex max-w-md flex-col items-center text-center">
            {/* Icon */}
            <div className="mb-8">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-emerald-100/50 blur-3xl dark:bg-emerald-900/20" />
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/50">
                  <FileQuestion className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </div>

            {/* 404 Number */}
            <div className="mb-4">
              <h1 className="text-8xl font-bold text-slate-900 dark:text-white">404</h1>
            </div>

            {/* Title */}
            <div className="mb-3">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                Page not found
              </h2>
            </div>

            {/* Description */}
            <div className="mb-8">
              <p className="text-slate-600 dark:text-slate-400">
                Sorry, the page you are looking for does not exist or has been moved.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="default"
                size="lg"
                className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                asChild
              >
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Go to Home
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
                onClick={() => router.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

'use client'

import type React from 'react'

import { useState } from 'react'
import Link from 'next/link'
import { isAxiosError } from 'axios'
import { AuthContainer } from '@/components/auth/auth-container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth'
import type { ApiErrorResponse } from '@/types/auth'

export default function ForgotPasswordPage() {
  const { forgotPassword, forgotPasswordPending } = useAuth()
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError('')
    setGeneralError(null)

    // Validation
    if (!email) {
      setEmailError('Vui lòng nhập email')
      return
    }

    if (!validateEmail(email)) {
      setEmailError('Email không hợp lệ')
      return
    }

    try {
      await forgotPassword({ email })
      setIsSubmitted(true)
    } catch (err) {
      setGeneralError(getErrorMessage(err))
    }
  }

  const getErrorMessage = (err: unknown) => {
    if (isAxiosError<ApiErrorResponse>(err)) {
      const data = err.response?.data
      if (data?.message) {
        return Array.isArray(data.message) ? data.message.join(', ') : data.message
      }
    }
    return 'Có lỗi xảy ra, vui lòng thử lại sau.'
  }

  // Success State
  if (isSubmitted) {
    return (
      <AuthContainer>
        <div className="mx-auto w-full max-w-sm text-center">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          {/* Header */}
          <div className="mb-6 space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl dark:text-white">
              Kiểm tra email của bạn
            </h1>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-white">
              Nếu email <span className="font-medium text-slate-900 dark:text-white">{email}</span>{' '}
              tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Vui lòng kiểm tra hộp thư (bao gồm cả mục Spam/Quảng cáo).
            </p>
          </div>

          {/* Info Box */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Link đặt lại mật khẩu sẽ có hiệu lực trong{' '}
              <span className="font-semibold">15 phút</span>. Nếu không thấy email, vui lòng kiểm
              tra Spam hoặc yêu cầu gửi lại.
            </p>
          </div>

          {/* Back to Login Button */}
          <Button
            asChild
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            <Link href="/auth/login">Quay lại đăng nhập</Link>
          </Button>
        </div>
      </AuthContainer>
    )
  }

  // Form State
  return (
    <AuthContainer>
      <div className="mx-auto w-full max-w-sm">
        {/* Mobile Logo */}
        <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl">
            <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8 space-y-2 text-center lg:text-left">
          <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl dark:text-white">
            Quên mật khẩu?
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Đừng lo, hãy nhập email và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu cho bạn.
          </p>
        </div>

        {/* General Error Alert */}
        {generalError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{generalError}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-white">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
              disabled={forgotPasswordPending}
            />
            {emailError && <p className="text-xs text-red-600 dark:text-red-400">{emailError}</p>}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={forgotPasswordPending}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            {forgotPasswordPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              'Gửi link đặt lại mật khẩu'
            )}
          </Button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Đã nhớ mật khẩu?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </AuthContainer>
  )
}

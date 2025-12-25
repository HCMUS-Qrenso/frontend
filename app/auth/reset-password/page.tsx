'use client'

import type React from 'react'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { extractErrorMessage } from '@/src/lib/helpers/error-handler'
import { AuthContainer } from '@/src/features/auth/components/auth-container'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Loader2, CheckCircle2, Eye, EyeOff, AlertCircle, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { useAuth } from '@/src/features/auth/hooks'


type PasswordStrength = 'weak' | 'medium' | 'strong'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [isValidatingToken, setIsValidatingToken] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { resetPassword, resetPasswordPending } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })

  const [fieldErrors, setFieldErrors] = useState({
    password: '',
    confirmPassword: '',
  })

  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>('weak')

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setIsTokenValid(false)
      setIsValidatingToken(false)
      return
    }
    setIsTokenValid(true)
    setIsValidatingToken(false)
  }, [token])

  // Calculate password strength
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength('weak')
      return
    }

    let strength = 0
    if (formData.password.length >= 8) strength++
    if (formData.password.length >= 12) strength++
    if (/[a-z]/.test(formData.password) && /[A-Z]/.test(formData.password)) strength++
    if (/\d/.test(formData.password)) strength++
    if (/[^a-zA-Z0-9]/.test(formData.password)) strength++

    if (strength <= 2) setPasswordStrength('weak')
    else if (strength <= 3) setPasswordStrength('medium')
    else setPasswordStrength('strong')
  }, [formData.password])

  const validatePassword = (password: string): string => {
    if (!password) return 'Vui lòng nhập mật khẩu mới'
    if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự'
    if (!/[a-z]/.test(password)) return 'Mật khẩu phải có ít nhất 1 chữ thường'
    if (!/[A-Z]/.test(password)) return 'Mật khẩu phải có ít nhất 1 chữ hoa'
    if (!/\d/.test(password)) return 'Mật khẩu phải có ít nhất 1 số'
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({ password: '', confirmPassword: '' })

    // Validation
    const errors = { password: '', confirmPassword: '' }
    let hasError = false

    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      errors.password = passwordError
      hasError = true
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Vui lòng nhập lại mật khẩu'
      hasError = true
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu nhập lại không khớp'
      hasError = true
    }

    if (hasError) {
      setFieldErrors(errors)
      return
    }

    try {
      await resetPassword({ token: token ?? '', newPassword: formData.password })
      setIsSuccess(true)
    } catch (err) {
      const message = extractErrorMessage(err)
      setFieldErrors((prev) => ({ ...prev, password: message }))
    }
  }



  // Loading State
  if (isValidatingToken) {
    return (
      <AuthContainer>
        <div className="mx-auto w-full max-w-sm text-center">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Đang xác thực...</p>
        </div>
      </AuthContainer>
    )
  }

  // Invalid Token State
  if (!isTokenValid) {
    return (
      <AuthContainer>
        <div className="mx-auto w-full max-w-sm text-center">
          {/* Warning Icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-500/10">
              <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
          </div>

          {/* Header */}
          <div className="mb-6 space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl dark:text-white">
              Link đã hết hạn hoặc không hợp lệ
            </h1>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Link đặt lại mật khẩu này đã hết hạn hoặc đã được sử dụng. Vui lòng yêu cầu một link
              mới.
            </p>
          </div>

          {/* Request New Link Button */}
          <Button
            asChild
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            <Link href="/auth/forgot-password">Gửi lại email đặt lại mật khẩu</Link>
          </Button>

          {/* Back to Login Link */}
          <div className="mt-6">
            <Link
              href="/auth/login"
              className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </AuthContainer>
    )
  }

  // Success State
  if (isSuccess) {
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
              Mật khẩu của bạn đã được cập nhật
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
            </p>
          </div>

          {/* Login Button */}
          <Button
            asChild
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            <Link href="/auth/login">Đăng nhập</Link>
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
            Đặt lại mật khẩu mới
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hãy tạo một mật khẩu mạnh để bảo vệ tài khoản của bạn.
          </p>
        </div>

        {/* Info Alert */}
        <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-xs text-amber-800 dark:text-amber-300">
            Link đặt lại mật khẩu này chỉ có hiệu lực trong 15 phút.
          </AlertDescription>
        </Alert>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* New Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-slate-700 dark:text-white"
            >
              Mật khẩu mới
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="rounded-xl border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
                disabled={resetPasswordPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                disabled={resetPasswordPending}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  <div
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      passwordStrength === 'weak'
                        ? 'bg-red-500'
                        : passwordStrength === 'medium'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    }`}
                  />
                  <div
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      passwordStrength === 'medium'
                        ? 'bg-amber-500'
                        : passwordStrength === 'strong'
                          ? 'bg-emerald-500'
                          : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                  <div
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      passwordStrength === 'strong'
                        ? 'bg-emerald-500'
                        : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                </div>
                <p
                  className={`text-xs font-medium ${
                    passwordStrength === 'weak'
                      ? 'text-red-600 dark:text-red-400'
                      : passwordStrength === 'medium'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {passwordStrength === 'weak' && 'Mật khẩu yếu'}
                  {passwordStrength === 'medium' && 'Mật khẩu trung bình'}
                  {passwordStrength === 'strong' && 'Mật khẩu mạnh'}
                </p>
              </div>
            )}

            {fieldErrors.password && (
              <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.password}</p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tối thiểu 8 ký tự, nên bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
            </p>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-slate-700 dark:text-white"
            >
              Nhập lại mật khẩu
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="rounded-xl border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
                disabled={resetPasswordPending}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                disabled={resetPasswordPending}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={resetPasswordPending}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            {resetPasswordPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang đặt lại...
              </>
            ) : (
              'Đặt lại mật khẩu'
            )}
          </Button>
        </form>

        {/* Back to Login Link */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Nhớ mật khẩu cũ?{' '}
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

function LoadingFallback() {
  return (
    <AuthContainer>
      <div className="mx-auto w-full max-w-sm text-center">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Đang xác thực...</p>
      </div>
    </AuthContainer>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  )
}

'use client'

import type React from 'react'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthContainer } from '@/components/auth/auth-container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, Loader2, UtensilsCrossed, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  })

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({ email: '', password: '' })

    // Validation
    const errors = { email: '', password: '' }
    let hasError = false

    if (!formData.email) {
      errors.email = 'Vui lòng nhập email'
      hasError = true
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Email không hợp lệ'
      hasError = true
    }

    if (!formData.password) {
      errors.password = 'Vui lòng nhập mật khẩu'
      hasError = true
    } else if (formData.password.length < 8) {
      errors.password = 'Mật khẩu phải có ít nhất 8 ký tự'
      hasError = true
    }

    if (hasError) {
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)

    // Mock login (replace with actual API call)
    setTimeout(() => {
      // Simulate error for demo
      if (formData.email === 'error@example.com') {
        setError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.')
        setIsLoading(false)
      } else {
        // Success - redirect to dashboard
        router.push('/admin/dashboard')
      }
    }, 1500)
  }

  return (
    <AuthContainer>
      <div className="mx-auto w-full max-w-sm">
        {/* Mobile Logo */}
        <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
        </div>

        {/* Header */}
        <div className="mb-8 space-y-2 text-center lg:text-left">
          <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl dark:text-white">
            Đăng nhập vào Smart Restaurant
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tiếp tục quản lý menu, bàn, order và KDS của bạn
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="rounded-xl border-slate-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
              disabled={isLoading}
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Mật khẩu
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="rounded-xl border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-50 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-600 dark:text-red-400">{fieldErrors.password}</p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">Tối thiểu 8 ký tự</p>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isLoading}
              />
              <label
                htmlFor="remember"
                className="text-xs font-medium text-slate-600 dark:text-slate-400"
              >
                Ghi nhớ đăng nhập
              </label>
            </div>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              Quên mật khẩu?
            </Link>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Bạn là khách dùng QR để gọi món?
            <br />
            Bạn không cần tài khoản để sử dụng menu.
          </p>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Chưa có tài khoản?{' '}
            <Link
              href="/contact"
              className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
            >
              Liên hệ chúng tôi
            </Link>{' '}
            để đăng ký Smart Restaurant.
          </p>
        </div>
      </div>
    </AuthContainer>
  )
}

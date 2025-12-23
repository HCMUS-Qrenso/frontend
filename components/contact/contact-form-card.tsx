'use client'

import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, Loader2 } from 'lucide-react'
import { submitContactForm } from '@/app/actions/contact'

type FormData = {
  fullName: string
  email: string
  phone: string
  restaurantName: string
  city: string
  branches: string
  needs: string
  notes: string
  honeypot: string
}

type FormErrors = Partial<Record<keyof FormData, string>>

export function ContactFormCard() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    restaurantName: '',
    city: '',
    branches: '',
    needs: '',
    notes: '',
    honeypot: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const validateField = (name: keyof FormData, value: string): string | null => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Vui lòng nhập họ và tên'
        if (value.trim().length < 2) return 'Họ tên phải có ít nhất 2 ký tự'
        return null
      case 'email':
        if (!value.trim()) return 'Vui lòng nhập email'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email không hợp lệ'
        return null
      case 'phone':
        if (!value.trim()) return 'Vui lòng nhập số điện thoại'
        if (!/^[0-9]{10,11}$/.test(value.replace(/\s/g, ''))) return 'Số điện thoại không hợp lệ'
        return null
      case 'restaurantName':
        if (!value.trim()) return 'Vui lòng nhập tên nhà hàng'
        return null
      default:
        return null
    }
  }

  const handleChange = (name: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleBlur = (name: keyof FormData) => {
    const error = validateField(name, formData[name])
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    const requiredFields: (keyof FormData)[] = ['fullName', 'email', 'phone', 'restaurantName']

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field])
      if (error) {
        newErrors[field] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Honeypot check
    if (formData.honeypot) {
      console.log('[v0] Spam detected via honeypot')
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Submit to server action
      const result = await submitContactForm(formData)

      if (result.success) {
        setIsSuccess(true)
      } else {
        alert('Có lỗi xảy ra. Vui lòng thử lại sau.')
      }
    } catch (error) {
      console.error('[v0] Form submission error:', error)
      alert('Có lỗi xảy ra. Vui lòng thử lại sau.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-[600px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/70 p-8 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
            <Check className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="mb-3 text-2xl font-bold text-black dark:text-white">
            Cảm ơn bạn đã liên hệ!
          </h3>
          <p className="mb-6 text-slate-600 dark:text-slate-300">
            Đội ngũ Qrenso sẽ liên hệ với bạn trong vòng{' '}
            <strong className="text-black dark:text-white">24 giờ làm việc</strong>.
          </p>
          <Button className="bg-emerald-600 text-white hover:bg-emerald-700" asChild>
            <a href="/">Quay về trang chủ</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 md:p-8 dark:border-slate-800 dark:bg-slate-900/70">
      <h2 className="mb-6 text-2xl font-bold text-black dark:text-white">Gửi yêu cầu</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Honeypot field - hidden from users */}
        <input
          type="text"
          name="website"
          value={formData.honeypot}
          onChange={(e) => handleChange('honeypot', e.target.value)}
          className="absolute left-[-9999px]"
          tabIndex={-1}
          autoComplete="off"
        />

        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-200">
            Họ và tên <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            placeholder="Nguyễn Văn A"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            onBlur={() => handleBlur('fullName')}
            className={`border-slate-300 bg-white text-black placeholder:text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500 ${
              errors.fullName ? 'border-red-500' : ''
            }`}
          />
          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700 dark:text-slate-200">
            Email công việc <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="nguyen.van.a@restaurant.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            className={`border-slate-300 bg-white text-black placeholder:text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500 ${
              errors.email ? 'border-red-500' : ''
            }`}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-slate-700 dark:text-slate-200">
            Số điện thoại <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="0901234567"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            className={`border-slate-300 bg-white text-black placeholder:text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500 ${
              errors.phone ? 'border-red-500' : ''
            }`}
          />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
        </div>

        {/* Restaurant Name */}
        <div className="space-y-2">
          <Label htmlFor="restaurantName" className="text-slate-700 dark:text-slate-200">
            Tên nhà hàng <span className="text-red-500">*</span>
          </Label>
          <Input
            id="restaurantName"
            placeholder="Nhà hàng ABC"
            value={formData.restaurantName}
            onChange={(e) => handleChange('restaurantName', e.target.value)}
            onBlur={() => handleBlur('restaurantName')}
            className={`border-slate-300 bg-white text-black placeholder:text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500 ${
              errors.restaurantName ? 'border-red-500' : ''
            }`}
          />
          {errors.restaurantName && <p className="text-sm text-red-500">{errors.restaurantName}</p>}
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city" className="text-slate-700 dark:text-slate-200">
            Khu vực / Thành phố{' '}
            <span className="text-sm text-slate-500 dark:text-slate-400">(Tùy chọn)</span>
          </Label>
          <Input
            id="city"
            placeholder="TP. Hồ Chí Minh"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className="border-slate-300 bg-white text-black placeholder:text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        {/* Branches */}
        <div className="space-y-2">
          <Label htmlFor="branches" className="text-slate-700 dark:text-slate-200">
            Số chi nhánh / Số bàn{' '}
            <span className="text-sm text-slate-500 dark:text-slate-400">(Tùy chọn)</span>
          </Label>
          <Input
            id="branches"
            placeholder="VD: 3 chi nhánh, ~30 bàn/chi nhánh"
            value={formData.branches}
            onChange={(e) => handleChange('branches', e.target.value)}
            className="border-slate-300 bg-white text-black placeholder:text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        {/* Needs */}
        <div className="space-y-2">
          <Label htmlFor="needs" className="text-slate-700 dark:text-slate-200">
            Nhu cầu
          </Label>
          <Select value={formData.needs} onValueChange={(value) => handleChange('needs', value)}>
            <SelectTrigger className="border-slate-300 bg-white text-black dark:border-slate-700 dark:bg-slate-800/50 dark:text-white">
              <SelectValue placeholder="Chọn nhu cầu của bạn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trial">Dùng thử</SelectItem>
              <SelectItem value="demo">Đặt lịch demo</SelectItem>
              <SelectItem value="consultation">Tư vấn triển khai</SelectItem>
              <SelectItem value="other">Khác</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-slate-700 dark:text-slate-200">
            Ghi chú <span className="text-sm text-slate-500 dark:text-slate-400">(Tùy chọn)</span>
          </Label>
          <Textarea
            id="notes"
            placeholder="Bạn có câu hỏi hoặc yêu cầu đặc biệt nào không?"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={4}
            className="border-slate-300 bg-white text-black placeholder:text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        {/* Submit Button */}
        <div className="space-y-4 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              'Gửi yêu cầu'
            )}
          </Button>

          {/* Privacy Note */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Chúng tôi chỉ sử dụng thông tin của bạn để liên hệ tư vấn và không chia sẻ cho bên thứ
            ba.
          </p>
        </div>
      </form>
    </div>
  )
}

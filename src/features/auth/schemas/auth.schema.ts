import { z } from 'zod'

/**
 * Auth Validation Schemas
 *
 * Used for form validation in login, register, password reset pages
 */

// Email validation schema (reusable)
export const emailSchema = z
  .string()
  .min(1, 'Vui lòng nhập email')
  .email('Email không hợp lệ')

// Password validation schema (reusable)
export const passwordSchema = z
  .string()
  .min(1, 'Vui lòng nhập mật khẩu')
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')

// Strong password schema (for registration)
export const strongPasswordSchema = z
  .string()
  .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
  .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
  .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
  .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số')

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean().optional().default(false),
})

// Forgot password form schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

// Reset password form schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token không hợp lệ'),
  newPassword: strongPasswordSchema,
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

// Setup password form schema (for invited staff)
export const setupPasswordSchema = z.object({
  email: emailSchema,
  token: z.string().min(1, 'Token không hợp lệ'),
  password: strongPasswordSchema,
  confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
})

// Type inference
export type LoginFormData = z.infer<typeof loginSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type SetupPasswordFormData = z.infer<typeof setupPasswordSchema>

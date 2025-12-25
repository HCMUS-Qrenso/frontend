import { z } from 'zod'

/**
 * Staff Validation Schemas
 *
 * Used for form validation in InviteStaffSheet and staff-related forms
 */

// Staff role enum
export const staffRoleSchema = z.enum(['admin', 'waiter', 'kitchen_staff'])

// Staff status enum
export const staffStatusSchema = z.enum(['active', 'inactive', 'suspended'])

// Phone number validation (Vietnamese format)
export const phoneSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === '') return true
      // Accept various Vietnamese phone formats
      const phoneRegex = /^(\+84|84|0)?[1-9]\d{8,9}$/
      return phoneRegex.test(val.replace(/\s|-/g, ''))
    },
    { message: 'Số điện thoại không hợp lệ' },
  )
  .transform((val) => val?.trim() || undefined)

// Invite staff form schema
export const inviteStaffSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Vui lòng nhập họ và tên')
    .max(100, 'Họ và tên không được vượt quá 100 ký tự')
    .transform((val) => val.trim()),
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không hợp lệ'),
  phone: phoneSchema,
  role: staffRoleSchema.default('waiter'),
})

// Update staff form schema
export const updateStaffSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Họ và tên không được để trống')
    .max(100, 'Họ và tên không được vượt quá 100 ký tự')
    .optional()
    .transform((val) => val?.trim()),
  phone: phoneSchema,
  status: staffStatusSchema.optional(),
})

// Update status schema
export const updateStaffStatusSchema = z.object({
  status: staffStatusSchema,
})

// Type inference
export type InviteStaffFormData = z.infer<typeof inviteStaffSchema>
export type UpdateStaffFormData = z.infer<typeof updateStaffSchema>
export type UpdateStaffStatusFormData = z.infer<typeof updateStaffStatusSchema>
export type StaffRole = z.infer<typeof staffRoleSchema>
export type StaffStatus = z.infer<typeof staffStatusSchema>

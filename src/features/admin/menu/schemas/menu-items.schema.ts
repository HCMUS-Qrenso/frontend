import { z } from 'zod'

/**
 * Menu Item Validation Schemas
 *
 * Used for form validation in MenuItemUpsertModal
 */

// Status enum
export const menuItemStatusSchema = z.enum(['available', 'unavailable', 'sold_out'])

// Nutritional info schema
export const nutritionalInfoSchema = z.object({
  fat: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseFloat(val) || 0 : val))
    .pipe(z.number().min(0, 'Lượng chất béo không được âm')),
  carbs: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseFloat(val) || 0 : val))
    .pipe(z.number().min(0, 'Lượng carbs không được âm')),
  protein: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseFloat(val) || 0 : val))
    .pipe(z.number().min(0, 'Lượng protein không được âm')),
  calories: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseFloat(val) || 0 : val))
    .pipe(z.number().min(0, 'Lượng calories không được âm')),
})

// Base schema for menu item fields
export const menuItemBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Vui lòng nhập tên món')
    .max(200, 'Tên món không được vượt quá 200 ký tự')
    .transform((val) => val.trim()),
  category_id: z.string().min(1, 'Vui lòng chọn danh mục'),
  base_price: z
    .union([z.string(), z.number()])
    .refine(
      (val) => {
        const num = typeof val === 'string' ? parseFloat(val) : val
        return !isNaN(num) && num > 0
      },
      { message: 'Giá phải lớn hơn 0' }
    ),
  description: z
    .string()
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự')
    .optional()
    .transform((val) => val?.trim() || undefined),
  preparation_time: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseInt(val) || 0 : val))
    .pipe(z.number().min(0, 'Thời gian chuẩn bị không được âm')),
  status: menuItemStatusSchema.default('available'),
  is_chef_recommendation: z.boolean().default(false),
  allergen_info: z
    .string()
    .max(500, 'Thông tin dị ứng không được vượt quá 500 ký tự')
    .optional()
    .transform((val) => val?.trim() || undefined),
  nutritional_info: nutritionalInfoSchema.optional(),
  modifier_group_ids: z.array(z.string()).optional(),
  image_urls: z.array(z.string().url()).optional(),
})

// Schema for creating a new menu item
export const createMenuItemSchema = menuItemBaseSchema

// Schema for updating a menu item (all fields optional)
export const updateMenuItemSchema = menuItemBaseSchema.partial()

// Form data schema (for use with react-hook-form)
// This allows string inputs that will be transformed
export const menuItemFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Vui lòng nhập tên món')
    .max(200, 'Tên món không được vượt quá 200 ký tự'),
  category_id: z.string().min(1, 'Vui lòng chọn danh mục'),
  base_price: z.string().min(1, 'Vui lòng nhập giá').refine(
    (val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num > 0
    },
    { message: 'Giá phải lớn hơn 0' }
  ),
  description: z.string().optional(),
  preparation_time: z.string().optional(),
  status: menuItemStatusSchema.default('available'),
  is_chef_recommendation: z.boolean().default(false),
  allergen_info: z.string().optional(),
  fat: z.string().optional(),
  carbs: z.string().optional(),
  protein: z.string().optional(),
  calories: z.string().optional(),
})

// Type inference from schemas
export type CreateMenuItemFormData = z.infer<typeof createMenuItemSchema>
export type UpdateMenuItemFormData = z.infer<typeof updateMenuItemSchema>
export type MenuItemFormData = z.infer<typeof menuItemFormSchema>
export type MenuItemStatus = z.infer<typeof menuItemStatusSchema>
export type NutritionalInfo = z.infer<typeof nutritionalInfoSchema>

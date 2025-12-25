import { z } from 'zod'

/**
 * Category Validation Schemas
 *
 * Used for form validation in CategoryUpsertModal
 */

// Base schema for category fields
export const categoryBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Vui lòng nhập tên danh mục')
    .max(100, 'Tên danh mục không được vượt quá 100 ký tự')
    .transform((val) => val.trim()),
  description: z
    .string()
    .max(500, 'Mô tả không được vượt quá 500 ký tự')
    .optional()
    .transform((val) => val?.trim() || undefined),
  is_active: z.boolean().default(true),
})

// Schema for creating a new category
export const createCategorySchema = categoryBaseSchema

// Schema for updating a category
export const updateCategorySchema = categoryBaseSchema.partial()

// Schema for reordering categories
export const reorderCategoriesSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string().uuid(),
      display_order: z.number().int().min(0),
    }),
  ),
})

// Schema for toggle status
export const toggleCategoryStatusSchema = z.object({
  is_active: z.boolean(),
})

// Type inference from schemas
export type CreateCategoryFormData = z.infer<typeof createCategorySchema>
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>
export type ReorderCategoriesFormData = z.infer<typeof reorderCategoriesSchema>

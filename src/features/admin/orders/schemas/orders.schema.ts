/**
 * Order Zod Schemas
 *
 * Validation schemas for order-related forms and API payloads.
 * Uses Vietnamese error messages for consistency with other features.
 */

import { z } from 'zod'

// Order Status enum
export const orderStatusSchema = z.enum([
  'pending',
  'accepted',
  'in_progress',
  'preparing',
  'ready',
  'served',
  'completed',
  'rejected',
  'cancelled',
])

export type OrderStatusSchema = z.infer<typeof orderStatusSchema>

// Override/Update Order Status Form
export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
  reason: z
    .string()
    .min(1, 'Vui lòng nhập lý do')
    .max(500, 'Lý do không được vượt quá 500 ký tự')
    .transform((val) => val.trim()),
  notifyStaff: z.boolean().optional().default(false),
})

export type UpdateOrderStatusFormData = z.infer<typeof updateOrderStatusSchema>

// Order Query Params (for filtering/pagination)
export const orderQueryParamsSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  status: orderStatusSchema.optional(),
  table_id: z.string().uuid().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'total']).optional().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc'),
})

export type OrderQueryParamsSchema = z.infer<typeof orderQueryParamsSchema>

// Order Item schema (for creating orders)
export const orderItemSchema = z.object({
  menu_item_id: z.string().uuid('ID món không hợp lệ'),
  quantity: z.coerce.number().min(1, 'Số lượng phải ít nhất là 1'),
  notes: z.string().max(200, 'Ghi chú không được vượt quá 200 ký tự').optional(),
  modifiers: z
    .array(
      z.object({
        id: z.string().uuid(),
        price_adjustment: z.number(),
      })
    )
    .optional(),
})

export type OrderItemFormData = z.infer<typeof orderItemSchema>

// Create Order schema
export const createOrderSchema = z.object({
  table_id: z.string().uuid('Vui lòng chọn bàn'),
  items: z.array(orderItemSchema).min(1, 'Đơn hàng phải có ít nhất 1 món'),
  notes: z.string().max(500, 'Ghi chú không được vượt quá 500 ký tự').optional(),
})

export type CreateOrderFormData = z.infer<typeof createOrderSchema>

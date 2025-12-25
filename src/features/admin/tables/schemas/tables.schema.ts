import { z } from 'zod'

/**
 * Tables Validation Schemas
 *
 * Used for form validation in TableUpsertModal and ZoneUpsertModal
 */

// Table shape enum
export const tableShapeSchema = z.enum(['circle', 'rectangle', 'oval'])

// Table status enum
export const tableStatusSchema = z.enum([
  'available',
  'occupied',
  'waiting_for_payment',
  'maintenance',
])

// Table position schema
export const tablePositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  rotation: z.number().default(0),
})

// Table form schema
export const tableFormSchema = z.object({
  table_number: z
    .string()
    .min(1, 'Vui lòng nhập tên/số bàn')
    .max(50, 'Tên bàn không được vượt quá 50 ký tự')
    .transform((val) => val.trim()),
  capacity: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseInt(val) : val))
    .pipe(z.number().min(1, 'Số ghế phải lớn hơn 0')),
  zone_id: z.string().optional(),
  shape: tableShapeSchema.default('circle'),
  status: tableStatusSchema.default('available'),
  is_active: z.boolean().default(true),
  autoGenerateQR: z.boolean().default(true),
  position: tablePositionSchema.optional(),
})

// Create table schema
export const createTableSchema = tableFormSchema

// Update table schema
export const updateTableSchema = tableFormSchema.partial()

// Zone form schema
export const zoneFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên khu vực không được để trống')
    .max(100, 'Tên khu vực không được vượt quá 100 ký tự')
    .transform((val) => val.trim()),
  description: z
    .string()
    .max(500, 'Mô tả không được vượt quá 500 ký tự')
    .optional()
    .transform((val) => val?.trim() || null),
  display_order: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === 'string' ? parseInt(val) : val))
    .pipe(z.number().min(1, 'Thứ tự hiển thị phải là số dương')),
  is_active: z.boolean().default(true),
})

// Create zone schema
export const createZoneSchema = zoneFormSchema

// Update zone schema
export const updateZoneSchema = zoneFormSchema.partial()

// Type inference
export type TableFormData = z.infer<typeof tableFormSchema>
export type CreateTableFormData = z.infer<typeof createTableSchema>
export type UpdateTableFormData = z.infer<typeof updateTableSchema>
export type ZoneFormData = z.infer<typeof zoneFormSchema>
export type CreateZoneFormData = z.infer<typeof createZoneSchema>
export type UpdateZoneFormData = z.infer<typeof updateZoneSchema>
export type TableShape = z.infer<typeof tableShapeSchema>
export type TableStatus = z.infer<typeof tableStatusSchema>
export type TablePosition = z.infer<typeof tablePositionSchema>

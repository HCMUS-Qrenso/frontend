'use client'

import type React from 'react'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Textarea } from '@/src/components/ui/textarea'
import { Switch } from '@/src/components/ui/switch'
import { Loader2 } from 'lucide-react'
import { useCreateCategoryMutation, useUpdateCategoryMutation } from '@/src/features/admin/menu/queries/categories.queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { toast } from 'sonner'
import { Category } from '@/src/features/admin/menu/types/categories'
import { createCategorySchema, type CreateCategoryFormData } from '@/src/features/admin/menu/schemas'

interface CategoryUpsertModalProps {
  open: boolean
  mode: 'create' | 'edit'
  category: Category | null
  onOpenChange: (open: boolean) => void
}

export function CategoryUpsertModal({
  open,
  mode,
  category,
  onOpenChange,
}: CategoryUpsertModalProps) {
  const { handleErrorWithStatus } = useErrorHandler()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Mutations
  const createMutation = useCreateCategoryMutation()
  const updateMutation = useUpdateCategoryMutation()

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  // Load data if editing
  useEffect(() => {
    if (mode === 'edit' && category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        is_active: category.is_active,
      })
    } else if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        is_active: true,
      })
    }
    setErrors({})
  }, [mode, category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate with Zod schema
    const result = createCategorySchema.safeParse(formData)

    if (!result.success) {
      // Convert Zod errors to our error format
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string
        fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    const validData = result.data

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync({
          name: validData.name,
          description: validData.description,
          is_active: validData.is_active,
        })
        toast.success('Đã tạo danh mục thành công')
      } else if (mode === 'edit' && category) {
        await updateMutation.mutateAsync({
          id: category.id,
          payload: {
            name: validData.name,
            description: validData.description,
            is_active: validData.is_active,
          },
        })
        toast.success('Đã cập nhật danh mục thành công')
      }

      // Success - close modal
      onOpenChange(false)
    } catch (error) {
      handleErrorWithStatus(error, undefined, 'Không thể lưu danh mục')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Tạo danh mục mới để nhóm các món ăn theo loại'
              : 'Cập nhật thông tin danh mục'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên danh mục <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ví dụ: Khai vị, Món chính, Tráng miệng..."
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả ngắn về danh mục này..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-800">
            <div className="space-y-0.5">
              <Label htmlFor="is_active" className="text-base">
                Hiển thị danh mục
              </Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Bật để hiển thị danh mục trong menu
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active || false}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                'Lưu'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

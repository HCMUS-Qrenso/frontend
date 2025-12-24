'use client'

import type React from 'react'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Textarea } from '@/src/components/ui/textarea'
import { Switch } from '@/src/components/ui/switch'
import { Loader2 } from 'lucide-react'
import { useCreateZoneMutation, useUpdateZoneMutation } from '@/src/features/admin/tables/queries/zones.queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { toast } from 'sonner'
import { Zone } from '@/src/features/admin/tables/types/zones'

interface ZoneUpsertModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  zone: Zone | null
  mode: 'create' | 'edit'
}

interface ZoneFormData {
  name: string
  description: string
  display_order: string
  is_active: boolean
}

const initialFormData: ZoneFormData = {
  name: '',
  description: '',
  display_order: '1',
  is_active: true,
}

export function ZoneUpsertModal({ open, onOpenChange, zone, mode }: ZoneUpsertModalProps) {
  const [formData, setFormData] = useState<ZoneFormData>(initialFormData)

  const isEdit = mode === 'edit'

  const createMutation = useCreateZoneMutation()
  const updateMutation = useUpdateZoneMutation()
  const { handleError } = useErrorHandler()

  const isLoading = createMutation.isPending || updateMutation.isPending

  // Load zone data for edit mode
  useEffect(() => {
    if (open && isEdit && zone) {
      setFormData({
        name: zone.name,
        description: zone.description || '',
        display_order: zone.display_order.toString(),
        is_active: zone.is_active,
      })
    } else if (open && !isEdit) {
      // Reset form for create mode
      setFormData(initialFormData)
    }
  }, [open, isEdit, zone])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Tên khu vực không được để trống')
      return
    }

    const displayOrder = parseInt(formData.display_order)
    if (isNaN(displayOrder) || displayOrder < 1) {
      toast.error('Thứ tự hiển thị phải là số dương')
      return
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        display_order: displayOrder,
        is_active: formData.is_active,
      }

      if (isEdit && zone) {
        await updateMutation.mutateAsync({ id: zone.id, payload })
        toast.success('Khu vực đã được cập nhật thành công')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Khu vực đã được tạo thành công')
      }

      onOpenChange(false)
    } catch (error: any) {
      handleError(error, 'Có lỗi xảy ra khi lưu khu vực')
    }
  }

  const handleInputChange = (field: keyof ZoneFormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-white">
            {isEdit ? 'Chỉnh sửa khu vực' : 'Thêm khu vực mới'}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            {isEdit
              ? 'Cập nhật thông tin khu vực bàn ăn'
              : 'Tạo khu vực mới để nhóm các bàn lại với nhau'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Tên khu vực <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ví dụ: Tầng 1 - Khu vực chính"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="rounded-lg"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Mô tả
            </Label>
            <Textarea
              id="description"
              placeholder="Mô tả ngắn gọn về khu vực này..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="min-h-20 resize-none rounded-lg"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_order" className="text-sm font-medium">
              Thứ tự hiển thị <span className="text-red-500">*</span>
            </Label>
            <Input
              id="display_order"
              type="number"
              min="1"
              placeholder="1"
              value={formData.display_order}
              onChange={(e) => handleInputChange('display_order', e.target.value)}
              className="rounded-lg"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="is_active" className="text-sm font-medium">
                Trạng thái hoạt động
              </Label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Khu vực sẽ hiển thị cho khách hàng khi bật
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="flex-1 rounded-lg"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Cập nhật' : 'Tạo khu vực'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import type React from 'react'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import { useZoneQuery, useCreateZoneMutation, useUpdateZoneMutation } from '@/hooks/use-zones-query'
import { useErrorHandler } from '@/hooks/use-error-handler'
import { toast } from 'sonner'

interface ZoneUpsertModalProps {
  open: boolean
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

export function ZoneUpsertModal({ open }: ZoneUpsertModalProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<ZoneFormData>(initialFormData)

  const mode = searchParams.get('mode') || 'create'
  const zoneId = searchParams.get('id')

  const isEdit = mode === 'edit'

  // Load zone data for edit mode
  const { data: zoneData } = useZoneQuery(zoneId || '', open && isEdit && !!zoneId)

  const createMutation = useCreateZoneMutation()
  const updateMutation = useUpdateZoneMutation()
  const { handleErrorWithStatus } = useErrorHandler()

  const isLoading = createMutation.isPending || updateMutation.isPending

  // Load zone data for edit mode
  useEffect(() => {
    if (open && isEdit && zoneData) {
      const zone = zoneData
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
  }, [open, isEdit, zoneData])

  const handleClose = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('modal')
    params.delete('mode')
    params.delete('id')
    router.push(`/admin/tables/zones?${params.toString()}`)
  }

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

      if (isEdit && zoneId) {
        await updateMutation.mutateAsync({ id: zoneId, payload })
        toast.success('Khu vực đã được cập nhật thành công')
      } else {
        await createMutation.mutateAsync(payload)
        toast.success('Khu vực đã được tạo thành công')
      }

      handleClose()
    } catch (error: any) {
      handleErrorWithStatus(error, 'Có lỗi xảy ra khi lưu khu vực')
    }
  }

  const handleInputChange = (field: keyof ZoneFormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
              className="min-h-[80px] resize-none rounded-lg"
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
              onClick={handleClose}
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

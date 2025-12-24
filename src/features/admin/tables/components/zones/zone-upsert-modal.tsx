'use client'

import { useEffect, useState } from 'react'
import { FormDialog, FormDialogField, FormDialogSection } from '@/src/components/ui/form-dialog'
import { Input } from '@/src/components/ui/input'
import { Textarea } from '@/src/components/ui/textarea'
import { Switch } from '@/src/components/ui/switch'
import { Label } from '@/src/components/ui/label'
import { useCreateZoneMutation, useUpdateZoneMutation } from '@/src/features/admin/tables/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { toast } from 'sonner'
import type { Zone } from '@/src/features/admin/tables/types'
import { zoneFormSchema } from '@/src/features/admin/tables/schemas'

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

  const handleSubmit = async () => {
    // Validate with Zod schema
    const result = zoneFormSchema.safeParse(formData)

    if (!result.success) {
      const firstError = result.error.issues[0]
      toast.error(firstError?.message || 'Dữ liệu không hợp lệ')
      return
    }

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        display_order: parseInt(formData.display_order),
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
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? 'Chỉnh sửa khu vực' : 'Thêm khu vực mới'}
      description={
        isEdit
          ? 'Cập nhật thông tin khu vực bàn ăn'
          : 'Tạo khu vực mới để nhóm các bàn lại với nhau'
      }
      onSubmit={handleSubmit}
      isSubmitting={isLoading}
      submitText={isEdit ? 'Cập nhật' : 'Tạo khu vực'}
      loadingText={isEdit ? 'Đang cập nhật...' : 'Đang tạo...'}
      size="sm"
    >
      {/* Tên khu vực */}
      <FormDialogField label="Tên khu vực" required>
        <Input
          id="name"
          placeholder="Ví dụ: Tầng 1 - Khu vực chính"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          disabled={isLoading}
        />
      </FormDialogField>

      {/* Mô tả */}
      <FormDialogField label="Mô tả">
        <Textarea
          id="description"
          placeholder="Mô tả ngắn gọn về khu vực này..."
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="min-h-20 resize-none"
          disabled={isLoading}
        />
      </FormDialogField>

      {/* Thứ tự hiển thị */}
      <FormDialogField label="Thứ tự hiển thị" required>
        <Input
          id="display_order"
          type="number"
          min="1"
          placeholder="1"
          value={formData.display_order}
          onChange={(e) => handleInputChange('display_order', e.target.value)}
          disabled={isLoading}
        />
      </FormDialogField>

      {/* Trạng thái hoạt động */}
      <FormDialogSection>
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
      </FormDialogSection>
    </FormDialog>
  )
}

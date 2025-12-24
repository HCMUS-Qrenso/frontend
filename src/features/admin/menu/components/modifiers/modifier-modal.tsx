'use client'

import { useEffect, useState } from 'react'
import { FormDialog, FormDialogField, FormDialogSection } from '@/src/components/ui/form-dialog'
import { Input } from '@/src/components/ui/input'
import { Switch } from '@/src/components/ui/switch'
import { Label } from '@/src/components/ui/label'
import { useCreateModifierMutation, useUpdateModifierMutation } from '@/src/features/admin/menu/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { toast } from 'sonner'
import type { Modifier } from '@/src/features/admin/menu/types/modifiers'

interface ModifierModalProps {
  open: boolean
  selectedGroupId: string | null
  mode: 'create' | 'edit'
  modifier: Modifier | null
  onOpenChange: (open: boolean) => void
}

export function ModifierModal({
  open,
  selectedGroupId,
  mode,
  modifier,
  onOpenChange,
}: ModifierModalProps) {
  const { handleErrorWithStatus } = useErrorHandler()

  // Mutations
  const createMutation = useCreateModifierMutation()
  const updateMutation = useUpdateModifierMutation()

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const [formData, setFormData] = useState({
    name: '',
    price_adjustment: 0,
    is_available: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load data if editing
  useEffect(() => {
    if (mode === 'edit' && modifier) {
      setFormData({
        name: modifier.name,
        price_adjustment: modifier.price_adjustment,
        is_available: modifier.is_available,
      })
    } else if (mode === 'create') {
      setFormData({
        name: '',
        price_adjustment: 0,
        is_available: true,
      })
    }
    setErrors({})
  }, [mode, modifier])

  const handleSubmit = async () => {
    setErrors({})

    // Validation
    if (!formData.name.trim()) {
      setErrors({ name: 'Vui lòng nhập tên option' })
      return
    }

    if (formData.name.length > 100) {
      setErrors({ name: 'Tên option không được vượt quá 100 ký tự' })
      return
    }

    if (!selectedGroupId) {
      toast.error('Vui lòng chọn nhóm trước')
      return
    }

    const payload = {
      name: formData.name,
      price_adjustment: formData.price_adjustment,
      is_available: formData.is_available,
    }

    if (mode === 'create') {
      createMutation.mutate(
        { groupId: selectedGroupId, payload },
        {
          onSuccess: () => {
            toast.success('Đã tạo option')
            onOpenChange(false)
          },
          onError: (error) => {
            handleErrorWithStatus(error)
            toast.error('Không thể tạo option')
          },
        },
      )
    } else if (mode === 'edit' && modifier) {
      updateMutation.mutate(
        { id: modifier.id, groupId: selectedGroupId, payload },
        {
          onSuccess: () => {
            toast.success('Đã cập nhật option')
            onOpenChange(false)
          },
          onError: (error) => {
            handleErrorWithStatus(error)
            toast.error('Không thể cập nhật option')
          },
        },
      )
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? 'Thêm option mới' : 'Chỉnh sửa option'}
      description={mode === 'create' ? 'Tạo tuỳ chọn mới cho nhóm' : 'Cập nhật thông tin tuỳ chọn'}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitText="Lưu"
      loadingText="Đang lưu..."
      size="md"
    >
      {/* Tên option */}
      <FormDialogField label="Tên option" required error={errors.name}>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Ví dụ: Lớn (Large), Phô mai thêm..."
          disabled={isSubmitting}
        />
      </FormDialogField>

      {/* Điều chỉnh giá */}
      <FormDialogField
        label="Điều chỉnh giá"
        hint="Số dương để tăng giá, số âm để giảm giá. Để 0 nếu không thay đổi."
      >
        <div className="relative">
          <Input
            id="price"
            type="number"
            value={formData.price_adjustment}
            onChange={(e) =>
              setFormData({
                ...formData,
                price_adjustment: Number.parseInt(e.target.value) || 0,
              })
            }
            placeholder="0"
            disabled={isSubmitting}
            className="pr-12"
          />
          <div className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-500">
            đ
          </div>
        </div>
      </FormDialogField>

      {/* Có sẵn */}
      <FormDialogSection>
        <div className="space-y-0.5">
          <Label htmlFor="is_available" className="text-sm font-medium">
            Có sẵn
          </Label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tắt nếu tạm thời hết hàng
          </p>
        </div>
        <Switch
          id="is_available"
          checked={formData.is_available}
          onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
          disabled={isSubmitting}
        />
      </FormDialogSection>
    </FormDialog>
  )
}

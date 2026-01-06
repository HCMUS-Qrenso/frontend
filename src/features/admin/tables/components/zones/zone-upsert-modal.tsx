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
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('tables')

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
      toast.error(firstError?.message || t('invalidData'))
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
        toast.success(t('zoneUpdatedSuccess'))
      } else {
        await createMutation.mutateAsync(payload)
        toast.success(t('zoneCreatedSuccess'))
      }

      onOpenChange(false)
    } catch (error: any) {
      handleError(error, t('saveZoneError'))
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
      title={isEdit ? t('editZoneTitle') : t('addNewZone')}
      description={
        isEdit
          ? t('editZoneDesc')
          : t('addZoneDesc')
      }
      onSubmit={handleSubmit}
      isSubmitting={isLoading}
      submitText={isEdit ? t('updateZoneBtn') : t('createZoneBtn')}
      loadingText={isEdit ? t('updatingZone') : t('creatingZone')}
      size="sm"
    >
      {/* Tên khu vực */}
      <FormDialogField label={t('zoneNameLabel')} required>
        <Input
          id="name"
          placeholder={t('zoneNamePlaceholder')}
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          disabled={isLoading}
        />
      </FormDialogField>

      {/* Mô tả */}
      <FormDialogField label={t('descriptionLabel')}>
        <Textarea
          id="description"
          placeholder={t('descriptionPlaceholder')}
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="min-h-20 resize-none"
          disabled={isLoading}
        />
      </FormDialogField>

      {/* Thứ tự hiển thị */}
      <FormDialogField label={t('displayOrderLabel')} required>
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
            {t('activeStatusLabel')}
          </Label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('activeStatusHint')}
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

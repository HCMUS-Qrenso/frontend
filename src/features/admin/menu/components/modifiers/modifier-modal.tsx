'use client'

import { useEffect, useState } from 'react'
import { FormDialog, FormDialogField, FormDialogSection } from '@/src/components/ui/form-dialog'
import { Input } from '@/src/components/ui/input'
import { Switch } from '@/src/components/ui/switch'
import { Label } from '@/src/components/ui/label'
import {
  useCreateModifierMutation,
  useUpdateModifierMutation,
} from '@/src/features/admin/menu/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { toast } from 'sonner'
import type { Modifier } from '@/src/features/admin/menu/types/modifiers'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('menu.modifiers.optionModal')

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
      setErrors({ name: t('nameRequired') })
      return
    }

    if (formData.name.length > 100) {
      setErrors({ name: t('nameMaxLength') })
      return
    }

    if (!selectedGroupId) {
      toast.error(t('selectGroupFirst'))
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
            toast.success(t('createSuccess'))
            onOpenChange(false)
          },
          onError: (error) => {
            handleErrorWithStatus(error)
            toast.error(t('createError'))
          },
        },
      )
    } else if (mode === 'edit' && modifier) {
      updateMutation.mutate(
        { id: modifier.id, groupId: selectedGroupId, payload },
        {
          onSuccess: () => {
            toast.success(t('updateSuccess'))
            onOpenChange(false)
          },
          onError: (error) => {
            handleErrorWithStatus(error)
            toast.error(t('updateError'))
          },
        },
      )
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? t('createTitle') : t('editTitle')}
      description={mode === 'create' ? t('createDesc') : t('editDesc')}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitText={t('save')}
      loadingText={t('saving')}
      size="md"
    >
      {/* Tên option */}
      <FormDialogField label={t('nameLabel')} required error={errors.name}>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={t('namePlaceholder')}
          disabled={isSubmitting}
        />
      </FormDialogField>

      {/* Điều chỉnh giá */}
      <FormDialogField
        label={t('priceAdjustment')}
        hint={t('priceHint')}
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
          <div className="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-500">đ</div>
        </div>
      </FormDialogField>

      {/* Có sẵn */}
      <FormDialogSection>
        <div className="space-y-0.5">
          <Label htmlFor="is_available" className="text-sm font-medium">
            {t('isAvailable')}
          </Label>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('isAvailableHint')}</p>
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


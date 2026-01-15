'use client'

import { useEffect, useState } from 'react'
import { FormDialog, FormDialogField, FormDialogSection } from '@/src/components/ui/form-dialog'
import { Input } from '@/src/components/ui/input'
import { Switch } from '@/src/components/ui/switch'
import { Label } from '@/src/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/src/components/ui/radio-group'
import type { ModifierGroup, ModifierGroupType } from '@/src/features/admin/menu/types/modifiers'
import {
  useCreateModifierGroupMutation,
  useUpdateModifierGroupMutation,
} from '@/src/features/admin/menu/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface ModifierGroupModalProps {
  open: boolean
  mode: 'create' | 'edit'
  modifierGroup: ModifierGroup | null
  onOpenChange: (open: boolean) => void
}

export function ModifierGroupModal({
  open,
  mode,
  modifierGroup,
  onOpenChange,
}: ModifierGroupModalProps) {
  const { handleErrorWithStatus } = useErrorHandler()
  const t = useTranslations('menu.modifiers.groupModal')

  // Mutations
  const createMutation = useCreateModifierGroupMutation()
  const updateMutation = useUpdateModifierGroupMutation()

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const [formData, setFormData] = useState<{
    name: string
    type: ModifierGroupType
    is_required: boolean
    min_selections: number
    max_selections: number | null
  }>({
    name: '',
    type: 'single_choice',
    is_required: false,
    min_selections: 0,
    max_selections: 1,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load data if editing
  useEffect(() => {
    if (mode === 'edit' && modifierGroup) {
      const group = modifierGroup
      setFormData({
        name: group.name,
        type: group.type,
        is_required: group.is_required,
        min_selections: group.min_selections,
        max_selections: group.max_selections,
      })
    } else if (mode === 'create') {
      setFormData({
        name: '',
        type: 'single_choice',
        is_required: false,
        min_selections: 0,
        max_selections: 1,
      })
    }
    setErrors({})
  }, [mode, modifierGroup])

  // Auto-adjust min/max based on type and required
  useEffect(() => {
    if (formData.type === 'single_choice') {
      setFormData((prev) => ({
        ...prev,
        max_selections: 1,
        min_selections: prev.is_required ? 1 : 0,
      }))
    } else if (formData.is_required && formData.min_selections === 0) {
      setFormData((prev) => ({ ...prev, min_selections: 1 }))
    }
  }, [formData.type, formData.is_required])

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

    if (formData.max_selections !== null && formData.min_selections > formData.max_selections) {
      setErrors({ selections: t('minMaxError') })
      return
    }

    const payload = {
      name: formData.name,
      type: formData.type,
      is_required: formData.is_required,
      min_selections: formData.min_selections,
      max_selections: formData.max_selections,
    }

    if (mode === 'create') {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t('createSuccess'))
          onOpenChange(false)
        },
        onError: (error) => {
          handleErrorWithStatus(error)
          toast.error(t('createError'))
        },
      })
    } else if (mode === 'edit' && modifierGroup) {
      updateMutation.mutate(
        { id: modifierGroup.id, payload },
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
      size="lg"
    >
      {/* Tên nhóm */}
      <FormDialogField label={t('nameLabel')} required error={errors.name}>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={t('namePlaceholder')}
          disabled={isSubmitting}
        />
      </FormDialogField>

      {/* Loại lựa chọn */}
      <div className="space-y-3">
        <Label>
          {t('selectionType')} <span className="text-red-500">*</span>
        </Label>
        <RadioGroup
          value={formData.type}
          onValueChange={(value) =>
            setFormData({ ...formData, type: value as 'single_choice' | 'multiple_choice' })
          }
          disabled={isSubmitting}
        >
          <div className="flex items-center space-x-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <RadioGroupItem value="single_choice" id="single" />
            <Label htmlFor="single" className="flex-1 cursor-pointer font-normal">
              <div className="font-medium">{t('singleChoice')}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {t('singleChoiceDesc')}
              </div>
            </Label>
          </div>
          <div className="flex items-center space-x-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700">
            <RadioGroupItem value="multiple_choice" id="multiple" />
            <Label htmlFor="multiple" className="flex-1 cursor-pointer font-normal">
              <div className="font-medium">{t('multipleChoice')}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {t('multipleChoiceDesc')}
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Bắt buộc chọn */}
      <FormDialogSection>
        <div className="space-y-0.5">
          <Label htmlFor="is_required" className="text-sm font-medium">
            {t('isRequired')}
          </Label>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('isRequiredHint')}</p>
        </div>
        <Switch
          id="is_required"
          checked={formData.is_required}
          onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
          disabled={isSubmitting}
        />
      </FormDialogSection>

      {/* Min/Max Selections - Only for multiple choice */}
      {formData.type === 'multiple_choice' && (
        <div className="grid grid-cols-2 gap-4">
          <FormDialogField label={t('minSelections')}>
            <Input
              id="min"
              type="number"
              min={0}
              value={formData.min_selections}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  min_selections: Number.parseInt(e.target.value) || 0,
                })
              }
              disabled={isSubmitting}
            />
          </FormDialogField>
          <FormDialogField label={t('maxSelections')}>
            <Input
              id="max"
              type="number"
              min={1}
              value={formData.max_selections || ''}
              onChange={(e) => {
                const val = e.target.value ? Number.parseInt(e.target.value) : null
                setFormData({ ...formData, max_selections: val })
              }}
              placeholder={t('maxPlaceholder')}
              disabled={isSubmitting}
            />
          </FormDialogField>
        </div>
      )}
      {errors.selections && <p className="text-xs text-red-600">{errors.selections}</p>}
    </FormDialog>
  )
}

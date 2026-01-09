'use client'

import { useEffect, useState } from 'react'
import { FormDialog, FormDialogField, FormDialogSection } from '@/src/components/ui/form-dialog'
import { Input } from '@/src/components/ui/input'
import { Textarea } from '@/src/components/ui/textarea'
import { Switch } from '@/src/components/ui/switch'
import { Label } from '@/src/components/ui/label'
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from '@/src/features/admin/menu/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { toast } from 'sonner'
import type { Category } from '@/src/features/admin/menu/types'
import { createCategorySchema } from '@/src/features/admin/menu/schemas'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('menu.upsert')

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

  const handleSubmit = async () => {
    setErrors({})

    // Validate with Zod schema
    const result = createCategorySchema.safeParse(formData)

    if (!result.success) {
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
        toast.success(t('createSuccess'))
      } else if (mode === 'edit' && category) {
        await updateMutation.mutateAsync({
          id: category.id,
          payload: {
            name: validData.name,
            description: validData.description,
            is_active: validData.is_active,
          },
        })
        toast.success(t('updateSuccess'))
      }

      onOpenChange(false)
    } catch (error) {
      handleErrorWithStatus(error, undefined, t('saveError'))
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
      {/* Tên danh mục */}
      <FormDialogField label={t('nameLabel')} required error={errors.name}>
        <Input
          id="name"
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder={t('namePlaceholder')}
          disabled={isSubmitting}
        />
      </FormDialogField>

      {/* Mô tả */}
      <FormDialogField label={t('descriptionLabel')}>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder={t('descriptionPlaceholder')}
          rows={3}
          disabled={isSubmitting}
        />
      </FormDialogField>

      {/* Hiển thị danh mục */}
      <FormDialogSection>
        <div className="space-y-0.5">
          <Label htmlFor="is_active" className="text-sm font-medium">
            {t('visibilityLabel')}
          </Label>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t('visibilityHint')}</p>
        </div>
        <Switch
          id="is_active"
          checked={formData.is_active || false}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          disabled={isSubmitting}
        />
      </FormDialogSection>
    </FormDialog>
  )
}

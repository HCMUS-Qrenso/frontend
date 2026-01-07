'use client'

import { useEffect, useState } from 'react'
import { FormDialog, FormDialogField, FormDialogSection } from '@/src/components/ui/form-dialog'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { Switch } from '@/src/components/ui/switch'
import { useCreateTableMutation, useUpdateTableMutation } from '@/src/features/admin/tables/queries'
import type {
  SimpleZone,
  TableStatus,
  TableShape,
  TablePosition,
  Table,
} from '@/src/features/admin/tables/types'
import { toast } from 'sonner'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { tableFormSchema } from '@/src/features/admin/tables/schemas'
import { useTranslations } from 'next-intl'

interface TableUpsertModalProps {
  open: boolean
  mode: 'create' | 'edit'
  table: Table | null
  zones: SimpleZone[] | undefined
  onOpenChange: (open: boolean) => void
}

interface TableFormData {
  table_number: string
  capacity: string
  zone_id: string
  shape: TableShape
  status: TableStatus
  is_active: boolean
  autoGenerateQR: boolean
  position?: TablePosition
}

const initialFormData: TableFormData = {
  table_number: '',
  capacity: '4',
  zone_id: '',
  shape: 'circle',
  status: 'available',
  is_active: true,
  autoGenerateQR: true,
  position: { x: -1, y: -1, rotation: 0 },
}

export function TableUpsertModal({
  open,
  mode,
  table,
  onOpenChange,
  zones,
}: TableUpsertModalProps) {
  const [formData, setFormData] = useState<TableFormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof TableFormData, string>>>({})
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations('tables')

  const createMutation = useCreateTableMutation()
  const updateMutation = useUpdateTableMutation()
  const { getErrorMessage } = useErrorHandler()

  useEffect(() => {
    if (mode === 'edit' && table) {
      let position: TablePosition | undefined
      if (table.position) {
        try {
          position = JSON.parse(table.position) as TablePosition
        } catch {
          // Invalid JSON, ignore
        }
      }

      setFormData({
        table_number: table.table_number,
        capacity: table.capacity.toString(),
        zone_id: table.zone?.id || table.zone_id || '',
        shape: (table.shape as TableShape) || 'rectangle',
        status: table.status,
        is_active: table.is_active,
        autoGenerateQR: false,
        position,
      })
    } else if (mode === 'create') {
      setFormData({ ...initialFormData, zone_id: zones && zones.length > 0 ? zones[0].id : '' })
    }
    setErrors({})
  }, [mode, table, zones])

  const validateForm = (): boolean => {
    const result = tableFormSchema.safeParse(formData)

    if (!result.success) {
      const newErrors: Partial<Record<keyof TableFormData, string>> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof TableFormData
        if (!newErrors[field]) {
          newErrors[field] = issue.message
        }
      })
      setErrors(newErrors)
      return false
    }

    setErrors({})
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const payload = {
        table_number: formData.table_number,
        capacity: Number.parseInt(formData.capacity),
        zone_id: formData.zone_id || undefined,
        shape: formData.shape,
        status: formData.status,
        is_active: formData.is_active,
        position: formData.position,
        auto_generate_qr: formData.autoGenerateQR,
      }

      if (mode === 'create') {
        await createMutation.mutateAsync(payload)
        toast.success(t('tableCreatedSuccess'))
      } else if (mode === 'edit' && table) {
        await updateMutation.mutateAsync({
          id: table.id,
          payload: { ...payload },
        })
        toast.success(t('tableUpdatedSuccess'))
      }

      onOpenChange(false)
    } catch (error: any) {
      console.error('Error saving table:', error)

      if (error?.response?.status === 409) {
        const conflictMessage = getErrorMessage(error, t('tableNumberExists'))
        toast.error(conflictMessage)
        setErrors({ table_number: t('tableNumberExistsHint') })
      } else if (error?.response?.status === 400) {
        const validationErrors = error?.response?.data?.message
        if (Array.isArray(validationErrors)) {
          validationErrors.forEach((msg: string) => {
            if (
              msg.toLowerCase().includes('table_number') ||
              msg.toLowerCase().includes('số bàn')
            ) {
              setErrors((prev) => ({ ...prev, table_number: msg }))
            } else if (
              msg.toLowerCase().includes('capacity') ||
              msg.toLowerCase().includes('sức chứa')
            ) {
              setErrors((prev) => ({ ...prev, capacity: msg }))
            } else {
              toast.error(msg)
            }
          })
        } else {
          const errorMessage = getErrorMessage(error, t('invalidData'))
          toast.error(errorMessage)
        }
      } else {
        const errorMessage = getErrorMessage(error, t('saveTableError'))
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? t('addNewTable') : t('editTableTitle')}
      description={
        mode === 'create'
          ? t('addTableDesc')
          : t('editTableDesc')
      }
      onSubmit={handleSubmit}
      isSubmitting={isLoading}
      submitText={t('saveTable')}
      loadingText={t('saving')}
      size="lg"
      scrollable
    >
      {/* Tên / Số bàn */}
      <FormDialogField label={t('tableNumberLabel')} required error={errors.table_number}>
        <Input
          id="table_number"
          value={formData.table_number}
          onChange={(e) => {
            setFormData({ ...formData, table_number: e.target.value })
            if (errors.table_number) {
              setErrors((prev) => ({ ...prev, table_number: undefined }))
            }
          }}
          placeholder={t('tableNumberPlaceholder')}
          className={errors.table_number ? 'border-red-500' : ''}
        />
      </FormDialogField>

      {/* Khu vực / Tầng */}
      <FormDialogField label={t('zoneFloorLabel')}>
        <Select
          value={formData.zone_id}
          onValueChange={(value) => {
            if (!value) return
            setFormData((prev) => ({ ...prev, zone_id: value }))
          }}
        >
          <SelectTrigger id="zone_id">
            <SelectValue placeholder={t('selectZone')} />
          </SelectTrigger>
          <SelectContent>
            {zones?.map((zone: SimpleZone) => (
              <SelectItem key={zone.id} value={zone.id}>
                {zone.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormDialogField>

      {/* Số ghế */}
      <FormDialogField label={t('seatsLabel')} required error={errors.capacity}>
        <Input
          id="capacity"
          type="number"
          min="1"
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
          placeholder="4"
          className={errors.capacity ? 'border-red-500' : ''}
        />
      </FormDialogField>

      {/* Hình dạng */}
      <FormDialogField label={t('shapeLabel')}>
        <Select
          value={formData.shape}
          onValueChange={(value) => setFormData({ ...formData, shape: value as TableShape })}
        >
          <SelectTrigger id="shape">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="circle">{t('shapeCircle')}</SelectItem>
            <SelectItem value="rectangle">{t('shapeRectangle')}</SelectItem>
            <SelectItem value="oval">{t('shapeOval')}</SelectItem>
          </SelectContent>
        </Select>
      </FormDialogField>

      {/* Trạng thái */}
      <FormDialogField
        label={t('operationStatus')}
        hint={t('operationStatusHint')}
      >
        <Select
          value={formData.status}
          onValueChange={(value) =>
            setFormData({ ...formData, status: value as TableFormData['status'] })
          }
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">{t('statusAvailable')}</SelectItem>
            <SelectItem value="occupied">{t('statusOccupied')}</SelectItem>
            <SelectItem value="waiting_for_payment">{t('statusWaitingPayment')}</SelectItem>
            <SelectItem value="maintenance">{t('statusMaintenance')}</SelectItem>
          </SelectContent>
        </Select>
      </FormDialogField>

      {/* Kích hoạt bàn */}
      <FormDialogSection>
        <div className="space-y-0.5">
          <Label htmlFor="is_active" className="cursor-pointer text-sm font-medium">
            {t('activateTable')}
          </Label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('activateTableHint')}
          </p>
        </div>
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
      </FormDialogSection>

      {/* Tự động tạo QR - Chỉ hiển thị ở chế độ tạo mới */}
      {mode === 'create' && (
        <FormDialogSection>
          <div className="space-y-0.5">
            <Label htmlFor="autoGenerateQR" className="cursor-pointer text-sm font-medium">
              {t('autoGenerateQR')}
            </Label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('autoGenerateQRHint')}
            </p>
          </div>
          <Switch
            id="autoGenerateQR"
            checked={formData.autoGenerateQR}
            onCheckedChange={(checked) => setFormData({ ...formData, autoGenerateQR: checked })}
          />
        </FormDialogSection>
      )}

      {/* ID bàn (read-only) - Chỉ hiển thị ở chế độ chỉnh sửa */}
      {mode === 'edit' && table && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
          <Label className="text-xs text-slate-500 dark:text-slate-400">{t('tableIdReadonly')}</Label>
          <p className="mt-1 font-mono text-sm text-slate-700 dark:text-slate-300">{table.id}</p>
        </div>
      )}
    </FormDialog>
  )
}

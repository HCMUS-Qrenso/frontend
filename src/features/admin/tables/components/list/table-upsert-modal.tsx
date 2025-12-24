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
import type { SimpleZone, TableStatus, TableShape, TablePosition, Table } from '@/src/features/admin/tables/types'
import { toast } from 'sonner'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { tableFormSchema } from '@/src/features/admin/tables/schemas'

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
        toast.success('Bàn đã được tạo thành công')
      } else if (mode === 'edit' && table) {
        await updateMutation.mutateAsync({
          id: table.id,
          payload: { ...payload },
        })
        toast.success('Bàn đã được cập nhật thành công')
      }

      onOpenChange(false)
    } catch (error: any) {
      console.error('Error saving table:', error)

      if (error?.response?.status === 409) {
        const conflictMessage = getErrorMessage(error, 'Số bàn đã tồn tại')
        toast.error(conflictMessage)
        setErrors({ table_number: 'Số bàn này đã tồn tại. Vui lòng chọn số khác.' })
      } else if (error?.response?.status === 400) {
        const validationErrors = error?.response?.data?.message
        if (Array.isArray(validationErrors)) {
          validationErrors.forEach((msg: string) => {
            if (msg.toLowerCase().includes('table_number') || msg.toLowerCase().includes('số bàn')) {
              setErrors((prev) => ({ ...prev, table_number: msg }))
            } else if (msg.toLowerCase().includes('capacity') || msg.toLowerCase().includes('sức chứa')) {
              setErrors((prev) => ({ ...prev, capacity: msg }))
            } else {
              toast.error(msg)
            }
          })
        } else {
          const errorMessage = getErrorMessage(error, 'Dữ liệu không hợp lệ')
          toast.error(errorMessage)
        }
      } else {
        const errorMessage = getErrorMessage(error, 'Có lỗi xảy ra khi lưu bàn')
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
      title={mode === 'create' ? 'Thêm bàn mới' : 'Chỉnh sửa bàn'}
      description={
        mode === 'create'
          ? 'Điền đầy đủ thông tin để thêm bàn mới vào hệ thống'
          : 'Cập nhật thông tin bàn trong form bên dưới'
      }
      onSubmit={handleSubmit}
      isSubmitting={isLoading}
      submitText="Lưu bàn"
      loadingText="Đang lưu..."
      size="lg"
      scrollable
    >
      {/* Tên / Số bàn */}
      <FormDialogField label="Tên / Số bàn" required error={errors.table_number}>
        <Input
          id="table_number"
          value={formData.table_number}
          onChange={(e) => {
            setFormData({ ...formData, table_number: e.target.value })
            if (errors.table_number) {
              setErrors((prev) => ({ ...prev, table_number: undefined }))
            }
          }}
          placeholder="Ví dụ: 1, A1, VIP01"
          className={errors.table_number ? 'border-red-500' : ''}
        />
      </FormDialogField>

      {/* Khu vực / Tầng */}
      <FormDialogField label="Khu vực / Tầng">
        <Select
          value={formData.zone_id}
          onValueChange={(value) => {
            if (!value) return
            setFormData((prev) => ({ ...prev, zone_id: value }))
          }}
        >
          <SelectTrigger id="zone_id">
            <SelectValue placeholder="Chọn khu vực" />
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
      <FormDialogField label="Số ghế" required error={errors.capacity}>
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
      <FormDialogField label="Hình dạng">
        <Select
          value={formData.shape}
          onValueChange={(value) => setFormData({ ...formData, shape: value as TableShape })}
        >
          <SelectTrigger id="shape">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="circle">Tròn</SelectItem>
            <SelectItem value="rectangle">Chữ nhật</SelectItem>
            <SelectItem value="oval">Oval</SelectItem>
          </SelectContent>
        </Select>
      </FormDialogField>

      {/* Trạng thái */}
      <FormDialogField
        label="Trạng thái (vận hành)"
        hint="Trạng thái vận hành của bàn (Trống, Đang sử dụng, Bảo trì)"
      >
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value as TableFormData['status'] })}
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Trống</SelectItem>
            <SelectItem value="occupied">Đang sử dụng</SelectItem>
            <SelectItem value="waiting_for_payment">Chờ thanh toán</SelectItem>
            <SelectItem value="maintenance">Bảo trì</SelectItem>
          </SelectContent>
        </Select>
      </FormDialogField>

      {/* Kích hoạt bàn */}
      <FormDialogSection>
        <div className="space-y-0.5">
          <Label htmlFor="is_active" className="cursor-pointer text-sm font-medium">
            Kích hoạt bàn
          </Label>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bàn có thể được sử dụng và hiển thị
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
              Tự động tạo QR sau khi lưu
            </Label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tạo mã QR ngay sau khi thêm bàn
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
          <Label className="text-xs text-slate-500 dark:text-slate-400">
            ID bàn (read-only)
          </Label>
          <p className="mt-1 font-mono text-sm text-slate-700 dark:text-slate-300">
            {table.id}
          </p>
        </div>
      )}
    </FormDialog>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { FormDialog, FormDialogField } from '@/src/components/ui/form-dialog'
import { Input } from '@/src/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { toast } from 'sonner'
import type { Staff } from '@/src/features/admin/staff/types'
import { useUpdateStaffMutation } from '@/src/features/admin/staff/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'

type StaffStatus = Staff['status']

interface StaffEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: Staff
}

export function StaffEditDialog({ open, onOpenChange, staff }: StaffEditDialogProps) {
  const [fullName, setFullName] = useState(staff.fullName)
  const [phone, setPhone] = useState(staff.phone || '')
  const [status, setStatus] = useState<StaffStatus>(staff.status)

  const updateMutation = useUpdateStaffMutation()
  const { handleError } = useErrorHandler()

  // Reset form when staff changes or dialog opens
  useEffect(() => {
    if (open) {
      setFullName(staff.fullName)
      setPhone(staff.phone || '')
      setStatus(staff.status)
    }
  }, [open, staff])

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      toast.error('Vui lòng nhập họ và tên')
      return
    }

    try {
      await updateMutation.mutateAsync({
        id: staff.id,
        payload: {
          fullName: fullName.trim(),
          phone: phone.trim() || undefined,
          status,
        },
      })
      toast.success('Đã cập nhật thông tin thành công')
      onOpenChange(false)
    } catch (error) {
      handleError(error, 'Không thể cập nhật thông tin')
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Chỉnh sửa nhân viên"
      description="Cập nhật thông tin nhân viên. Email không thể thay đổi."
      onSubmit={handleSubmit}
      isSubmitting={updateMutation.isPending}
      submitText="Lưu thay đổi"
      loadingText="Đang lưu..."
      size="md"
    >
      {/* Họ và tên */}
      <FormDialogField label="Họ và tên" required>
        <Input
          id="full_name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={updateMutation.isPending}
        />
      </FormDialogField>

      {/* Email (read-only) */}
      <FormDialogField label="Email">
        <Input
          id="email"
          value={staff.email}
          disabled
          className="bg-slate-50 dark:bg-slate-900"
        />
      </FormDialogField>

      {/* Số điện thoại */}
      <FormDialogField label="Số điện thoại">
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Nhập số điện thoại"
          disabled={updateMutation.isPending}
        />
      </FormDialogField>

      {/* Vai trò (read-only) */}
      <FormDialogField label="Vai trò">
        <Input
          id="role"
          value={staff.role === 'waiter' ? 'Phục vụ' : staff.role === 'admin' ? 'Quản trị viên' : 'Nhân viên bếp'}
          disabled
          className="bg-slate-50 dark:bg-slate-900"
        />
      </FormDialogField>

      {/* Trạng thái */}
      <FormDialogField label="Trạng thái">
        <Select
          value={status}
          onValueChange={(value: StaffStatus) => setStatus(value)}
          disabled={updateMutation.isPending}
        >
          <SelectTrigger id="status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Hoạt động</SelectItem>
            <SelectItem value="inactive">Không hoạt động</SelectItem>
            <SelectItem value="suspended">Đình chỉ</SelectItem>
          </SelectContent>
        </Select>
      </FormDialogField>
    </FormDialog>
  )
}

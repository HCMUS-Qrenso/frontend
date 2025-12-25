'use client'

import { useState, useEffect } from 'react'
import { FormDialog, FormDialogField } from '@/src/components/ui/form-dialog'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Badge } from '@/src/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { toast } from 'sonner'
import { useCreateStaffMutation } from '@/src/features/admin/staff/queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { useAuth } from '@/src/features/auth/hooks'
import { inviteStaffSchema } from '@/src/features/admin/staff/schemas'

type StaffRole = 'admin' | 'waiter' | 'kitchen_staff'

interface InviteStaffSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultRole: 'waiter' | 'kitchen_staff'
}

export function InviteStaffSheet({ open, onOpenChange, defaultRole }: InviteStaffSheetProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<StaffRole>(defaultRole)

  const { user } = useAuth()
  const createMutation = useCreateStaffMutation()
  const { handleError } = useErrorHandler()

  // Check if current user is Owner
  const isOwner = user?.role === 'owner'

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFullName('')
      setEmail('')
      setPhone('')
      setRole(defaultRole)
    }
  }, [open, defaultRole])

  // Update role when defaultRole changes
  useEffect(() => {
    setRole(defaultRole)
  }, [defaultRole])

  const handleSubmit = async () => {
    // Validate with Zod schema
    const result = inviteStaffSchema.safeParse({
      fullName,
      email,
      phone: phone || undefined,
      role,
    })

    if (!result.success) {
      const firstError = result.error.issues[0]
      toast.error(firstError?.message || 'Dữ liệu không hợp lệ')
      return
    }

    try {
      await createMutation.mutateAsync({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        role,
      })

      toast.success(
        'Đã gửi lời mời thành công! Nhân viên sẽ nhận được email để thiết lập mật khẩu.',
      )
      onOpenChange(false)
    } catch (error) {
      handleError(error, 'Không thể gửi lời mời')
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Mời nhân viên mới"
      description="Tạo tài khoản và gửi email mời cho nhân viên. Họ sẽ nhận được link để thiết lập mật khẩu."
      onSubmit={handleSubmit}
      isSubmitting={createMutation.isPending}
      submitText="Gửi lời mời"
      loadingText="Đang gửi..."
      size="md"
    >
      {/* Họ và tên */}
      <FormDialogField label="Họ và tên" required>
        <Input
          id="full_name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nguyễn Văn A"
          disabled={createMutation.isPending}
        />
      </FormDialogField>

      {/* Email */}
      <FormDialogField label="Email" required>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@restaurant.com"
          disabled={createMutation.isPending}
        />
      </FormDialogField>

      {/* Số điện thoại */}
      <FormDialogField label="Số điện thoại">
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Nhập số điện thoại"
          disabled={createMutation.isPending}
        />
      </FormDialogField>

      {/* Vai trò */}
      <FormDialogField label="Vai trò">
        <Select
          value={role}
          onValueChange={(value) => setRole(value as StaffRole)}
          disabled={createMutation.isPending}
        >
          <SelectTrigger id="role">
            <SelectValue placeholder="Chọn vai trò" />
          </SelectTrigger>
          <SelectContent>
            {/* Admin option - Only visible for Owner */}
            {isOwner && (
              <SelectItem value="admin">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                  Quản trị viên
                </span>
              </SelectItem>
            )}
            <SelectItem value="waiter">Phục vụ</SelectItem>
            <SelectItem value="kitchen_staff">Nhân viên bếp</SelectItem>
          </SelectContent>
        </Select>
      </FormDialogField>

      {/* Trạng thái ban đầu */}
      <div className="space-y-2">
        <Label>Trạng thái ban đầu</Label>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            Hoạt động
          </Badge>
          <span className="text-xs text-slate-500">(Mặc định)</span>
        </div>
      </div>
    </FormDialog>
  )
}

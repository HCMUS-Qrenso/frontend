'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
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
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCreateStaffMutation } from '@/src/features/admin/staff/queries/staff.queries'
import { useErrorHandler } from '@/src/hooks/use-error-handler'
import { useAuth } from '@/src/hooks/use-auth'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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

      toast.success('Đã gửi lời mời thành công! Nhân viên sẽ nhận được email để thiết lập mật khẩu.')
      onOpenChange(false)
    } catch (error) {
      handleError(error, 'Không thể gửi lời mời')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Mời nhân viên mới</DialogTitle>
            <DialogDescription>
              Tạo tài khoản và gửi email mời cho nhân viên. Họ sẽ nhận được link để thiết lập mật
              khẩu.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name">
                Họ và tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
                disabled={createMutation.isPending}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@restaurant.com"
                required
                disabled={createMutation.isPending}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                disabled={createMutation.isPending}
              />
            </div>

            {/* Role Select */}
            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
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
            </div>

            {/* Initial Status */}
            <div className="space-y-2">
              <Label>Trạng thái ban đầu</Label>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                  Hoạt động
                </Badge>
                <span className="text-xs text-slate-500">(Mặc định)</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gửi lời mời
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

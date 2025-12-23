'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MoreVertical, Pencil, Lock, Unlock, Key, Mail, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Staff } from '@/types/staff'
import {
  useUpdateStaffMutation,
  useUpdateStaffStatusMutation,
  useDeleteStaffMutation,
  useResetPasswordMutation,
  useResendInviteMutation,
} from '@/hooks/use-staff-query'
import { useErrorHandler } from '@/hooks/use-error-handler'

interface StaffRowActionsProps {
  staff: Staff
}

export function StaffRowActions({ staff }: StaffRowActionsProps) {
  const [lockDialogOpen, setLockDialogOpen] = useState(false)
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)
  const [resendInviteDialogOpen, setResendInviteDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  // Edit form state
  const [fullName, setFullName] = useState(staff.fullName)
  const [phone, setPhone] = useState(staff.phone || '')
  const [status, setStatus] = useState(staff.status)

  // Mutations
  const updateMutation = useUpdateStaffMutation()
  const updateStatusMutation = useUpdateStaffStatusMutation()
  const deleteMutation = useDeleteStaffMutation()
  const resetPasswordMutation = useResetPasswordMutation()
  const resendInviteMutation = useResendInviteMutation()
  const { handleError } = useErrorHandler()

  const handleLock = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        id: staff.id,
        payload: { status: 'suspended' },
      })
      toast.success('Đã khóa tài khoản thành công')
      setLockDialogOpen(false)
    } catch (error) {
      handleError(error, 'Không thể khóa tài khoản')
    }
  }

  const handleUnlock = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        id: staff.id,
        payload: { status: 'active' },
      })
      toast.success('Đã mở khóa tài khoản thành công')
      setUnlockDialogOpen(false)
    } catch (error) {
      handleError(error, 'Không thể mở khóa tài khoản')
    }
  }

  const handleResetPassword = async () => {
    try {
      await resetPasswordMutation.mutateAsync(staff.id)
      toast.success('Đã gửi email reset mật khẩu')
      setResetPasswordDialogOpen(false)
    } catch (error) {
      handleError(error, 'Không thể gửi email reset mật khẩu')
    }
  }

  const handleResendInvite = async () => {
    try {
      await resendInviteMutation.mutateAsync(staff.id)
      toast.success('Đã gửi lại email mời thành công')
      setResendInviteDialogOpen(false)
    } catch (error) {
      handleError(error, 'Không thể gửi lại email mời')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(staff.id)
      toast.success('Đã xóa nhân viên thành công')
      setDeleteDialogOpen(false)
    } catch (error) {
      handleError(error, 'Không thể xóa nhân viên')
    }
  }

  const handleSaveEdit = async () => {
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
      setEditDialogOpen(false)
    } catch (error) {
      handleError(error, 'Không thể cập nhật thông tin')
    }
  }

  const isLoading =
    updateMutation.isPending ||
    updateStatusMutation.isPending ||
    deleteMutation.isPending ||
    resetPasswordMutation.isPending ||
    resendInviteMutation.isPending

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreVertical className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>

          {staff.emailVerified ? (
            <DropdownMenuItem onClick={() => setResetPasswordDialogOpen(true)}>
              <Key className="mr-2 h-4 w-4" />
              Reset mật khẩu
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setResendInviteDialogOpen(true)}>
              <Mail className="mr-2 h-4 w-4" />
              Gửi lại lời mời
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {staff.status === 'suspended' ? (
            <DropdownMenuItem onClick={() => setUnlockDialogOpen(true)} className="text-emerald-600">
              <Unlock className="mr-2 h-4 w-4" />
              Mở khóa
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setLockDialogOpen(true)} className="text-red-600">
              <Lock className="mr-2 h-4 w-4" />
              Khóa tài khoản
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa nhân viên
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Lock Dialog */}
      <AlertDialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Khóa tài khoản?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn khóa tài khoản <strong>{staff.fullName}</strong>? Họ sẽ không
              thể đăng nhập cho đến khi được mở khóa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateStatusMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLock}
              className="bg-red-600 hover:bg-red-700"
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Khóa tài khoản
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unlock Dialog */}
      <AlertDialog open={unlockDialogOpen} onOpenChange={setUnlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mở khóa tài khoản?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn mở khóa tài khoản <strong>{staff.fullName}</strong>? Họ sẽ có
              thể đăng nhập trở lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateStatusMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnlock}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mở khóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Dialog */}
      <AlertDialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset mật khẩu?</AlertDialogTitle>
            <AlertDialogDescription>
              Gửi email reset mật khẩu đến <strong>{staff.email}</strong>? Nhân viên sẽ nhận được
              link để tạo mật khẩu mới.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetPasswordMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetPassword}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gửi email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resend Invite Dialog */}
      <AlertDialog open={resendInviteDialogOpen} onOpenChange={setResendInviteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gửi lại lời mời?</AlertDialogTitle>
            <AlertDialogDescription>
              Gửi lại email mời đến <strong>{staff.email}</strong>? Nhân viên sẽ nhận được link mới
              để thiết lập mật khẩu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resendInviteMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResendInvite}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={resendInviteMutation.isPending}
            >
              {resendInviteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gửi lại
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa nhân viên?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa <strong>{staff.fullName}</strong>? Hành động này không thể
              hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa nhân viên</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin nhân viên. Email không thể thay đổi.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Họ và tên</Label>
              <Input
                id="full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={updateMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={staff.email}
                disabled
                className="bg-slate-50 dark:bg-slate-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                disabled={updateMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
              <Input
                id="role"
                value={staff.role === 'waiter' ? 'Phục vụ' : 'Nhân viên bếp'}
                disabled
                className="bg-slate-50 dark:bg-slate-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={status}
                onValueChange={(value: 'active' | 'inactive' | 'suspended') => setStatus(value)}
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
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={updateMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

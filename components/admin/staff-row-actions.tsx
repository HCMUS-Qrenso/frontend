"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreVertical, Pencil, Lock, Unlock, Key } from "lucide-react"

interface User {
  id: string
  email: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  role: "waiter" | "kitchen_staff"
  tenant_id: string
  email_verified: boolean
  status: "active" | "inactive" | "suspended"
  last_login_at: string | null
  created_at: string
  updated_at: string
}

interface StaffRowActionsProps {
  user: User
  onUpdate: (user: User) => void
}

export function StaffRowActions({ user, onUpdate }: StaffRowActionsProps) {
  const [lockDialogOpen, setLockDialogOpen] = useState(false)
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false)
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false)
  const [editSheetOpen, setEditSheetOpen] = useState(false)

  // Edit form state
  const [fullName, setFullName] = useState(user.full_name)
  const [phone, setPhone] = useState(user.phone || "")
  const [status, setStatus] = useState(user.status)

  const handleLock = () => {
    onUpdate({ ...user, status: "suspended" })
    setLockDialogOpen(false)
  }

  const handleUnlock = () => {
    onUpdate({ ...user, status: "active" })
    setUnlockDialogOpen(false)
  }

  const handleResetPassword = () => {
    // TODO: Call API to reset password
    console.log("Reset password for", user.email)
    setResetPasswordDialogOpen(false)
  }

  const handleSaveEdit = () => {
    onUpdate({
      ...user,
      full_name: fullName,
      phone: phone || null,
      status,
      updated_at: new Date().toISOString(),
    })
    setEditSheetOpen(false)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditSheetOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setResetPasswordDialogOpen(true)}>
            <Key className="mr-2 h-4 w-4" />
            Reset mật khẩu
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {user.status === "suspended" ? (
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
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Lock Dialog */}
      <AlertDialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Khóa tài khoản?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn khóa tài khoản <strong>{user.full_name}</strong>? Họ sẽ không thể đăng nhập cho đến
              khi được mở khóa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleLock} className="bg-red-600 hover:bg-red-700">
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
              Bạn có chắc chắn muốn mở khóa tài khoản <strong>{user.full_name}</strong>? Họ sẽ có thể đăng nhập trở lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnlock} className="bg-emerald-600 hover:bg-emerald-700">
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
              Gửi email reset mật khẩu đến <strong>{user.email}</strong>? Nhân viên sẽ nhận được link để tạo mật khẩu
              mới.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword} className="bg-emerald-600 hover:bg-emerald-700">
              Gửi email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Sheet */}
      <Sheet open={editSheetOpen} onOpenChange={setEditSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Chỉnh sửa nhân viên</SheetTitle>
            <SheetDescription>Cập nhật thông tin nhân viên. Email không thể thay đổi.</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Họ và tên</Label>
              <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled className="bg-slate-50 dark:bg-slate-900" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+84 xxx xxx xxx"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={user.role === "waiter" ? "Waiter" : "Kitchen Staff"}
                disabled
                className="bg-slate-50 dark:bg-slate-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEditSheetOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveEdit} className="bg-emerald-600 hover:bg-emerald-700">
              Lưu thay đổi
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

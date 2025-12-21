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
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface InviteStaffSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultRole: 'waiter' | 'kitchen_staff'
}

export function InviteStaffSheet({ open, onOpenChange, defaultRole }: InviteStaffSheetProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'waiter' | 'kitchen_staff'>(defaultRole)
  const [isLoading, setIsLoading] = useState(false)

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFullName('')
      setEmail('')
      setPhone('')
      setRole(defaultRole)
      setIsLoading(false)
    }
  }, [open, defaultRole])

  // Update role when defaultRole changes
  useEffect(() => {
    setRole(defaultRole)
  }, [defaultRole])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert('Vui lòng nhập email hợp lệ')
      return
    }

    setIsLoading(true)

    // TODO: Call API to create/invite staff
    console.log('Inviting staff:', {
      full_name: fullName,
      email,
      phone: phone || null,
      role,
      status: 'active',
    })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoading(false)
    onOpenChange(false)

    // Show success toast (would use toast library in real app)
    alert('Đã gửi lời mời thành công!')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Mời nhân viên mới</DialogTitle>
            <DialogDescription>
              Tạo tài khoản và gửi email mời cho nhân viên. Họ sẽ nhận được link để đăng nhập.
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                placeholder="+84 xxx xxx xxx"
                disabled={isLoading}
              />
            </div>

            {/* Role Select */}
            <div className="space-y-2">
              <Label htmlFor="role">Vai trò</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as 'waiter' | 'kitchen_staff')}
                disabled={isLoading}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
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
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gửi lời mời
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

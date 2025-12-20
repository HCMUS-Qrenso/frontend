'use client'

import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'

const ORDER_STATUSES = [
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'accepted', label: 'Đã nhận' },
  { value: 'in_progress', label: 'Đang xử lý' },
  { value: 'preparing', label: 'Đang chuẩn bị' },
  { value: 'ready', label: 'Sẵn sàng' },
  { value: 'served', label: 'Đã phục vụ' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'rejected', label: 'Từ chối' },
  { value: 'cancelled', label: 'Đã hủy' },
]

interface OverrideStatusModalProps {
  orderId: string
  currentStatus: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OverrideStatusModal({
  orderId,
  currentStatus,
  open,
  onOpenChange,
}: OverrideStatusModalProps) {
  const [newStatus, setNewStatus] = useState('')
  const [reason, setReason] = useState('')
  const [notifyStaff, setNotifyStaff] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newStatus || !reason.trim()) {
      alert('Vui lòng chọn trạng thái mới và nhập lý do')
      return
    }

    setLoading(true)
    console.log('[v0] Override status:', { orderId, currentStatus, newStatus, reason, notifyStaff })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setLoading(false)
    onOpenChange(false)

    // Reset form
    setNewStatus('')
    setReason('')
    setNotifyStaff(false)

    // Show success toast (would use toast library in real app)
    alert('Đã cập nhật trạng thái thành công!')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Thay đổi trạng thái đơn hàng</DialogTitle>
            <DialogDescription>
              Thay đổi trạng thái đơn hàng #{orderId}. Vui lòng nhập lý do để ghi vào lịch sử.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Current Status */}
            <div className="space-y-2">
              <Label>Trạng thái hiện tại</Label>
              <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
                <p className="text-sm font-medium text-slate-900 capitalize dark:text-white">
                  {currentStatus}
                </p>
              </div>
            </div>

            {/* New Status */}
            <div className="space-y-2">
              <Label htmlFor="new-status">Trạng thái mới *</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="new-status">
                  <SelectValue placeholder="Chọn trạng thái mới" />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.filter((s) => s.value !== currentStatus).map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Lý do *</Label>
              <Textarea
                id="reason"
                placeholder="Nhập lý do thay đổi trạng thái..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
              />
            </div>

            {/* Notify Staff */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notify"
                checked={notifyStaff}
                onCheckedChange={(checked) => setNotifyStaff(checked === true)}
              />
              <label
                htmlFor="notify"
                className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Thông báo cho nhân viên
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xác nhận
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState } from 'react'
import { FormDialog, FormDialogField } from '@/src/components/ui/form-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { Textarea } from '@/src/components/ui/textarea'
import { Label } from '@/src/components/ui/label'
import { Checkbox } from '@/src/components/ui/checkbox'

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

  const handleSubmit = async () => {
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
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Thay đổi trạng thái đơn hàng"
      description={`Thay đổi trạng thái đơn hàng #${orderId}. Vui lòng nhập lý do để ghi vào lịch sử.`}
      onSubmit={handleSubmit}
      isSubmitting={loading}
      submitText="Xác nhận"
      loadingText="Đang xử lý..."
      size="md"
    >
      {/* Trạng thái hiện tại */}
      <div className="space-y-2">
        <Label>Trạng thái hiện tại</Label>
        <div className="rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
          <p className="text-sm font-medium text-slate-900 capitalize dark:text-white">
            {currentStatus}
          </p>
        </div>
      </div>

      {/* Trạng thái mới */}
      <FormDialogField label="Trạng thái mới" required>
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
      </FormDialogField>

      {/* Lý do */}
      <FormDialogField label="Lý do" required>
        <Textarea
          id="reason"
          placeholder="Nhập lý do thay đổi trạng thái..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
        />
      </FormDialogField>

      {/* Thông báo cho nhân viên */}
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
    </FormDialog>
  )
}

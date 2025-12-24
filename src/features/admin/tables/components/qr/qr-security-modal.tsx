'use client'

import { Shield, AlertTriangle, CheckCircle2, Eye } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/src/components/ui/dialog'

interface QRSecurityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QRSecurityModal({ open, onOpenChange }: QRSecurityModalProps) {
  const bestPractices = [
    {
      icon: CheckCircle2,
      text: 'Dán QR ở nơi khách dễ thấy nhưng không dễ bị bóc/dán đè.',
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Eye,
      text: 'Nên in kèm số bàn bên cạnh QR để tránh nhầm lẫn giữa các bàn.',
      color: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      icon: CheckCircle2,
      text: 'Thỉnh thoảng kiểm tra xem QR trên bàn có bị thay thế, hỏng, mờ hay không và thay mới khi cần.',
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Shield,
      text: 'Đảm bảo link QR luôn là domain chính thức của nhà hàng để tránh trường hợp khách bị dẫn sang trang giả mạo.',
      color: 'text-emerald-600 dark:text-emerald-400',
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 dark:bg-emerald-500/10">
              <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <DialogTitle>Lưu ý bảo mật khi sử dụng QR menu</DialogTitle>
              <DialogDescription>Thực hành tốt nhất & cảnh báo quan trọng</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Best practices section */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Thực hành tốt nhất cho QR menu
          </h4>
          <div className="space-y-2.5">
            {bestPractices.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50"
              >
                <div className={`mt-0.5 flex-shrink-0 ${tip.color}`}>
                  <tip.icon className="h-4 w-4" />
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {tip.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quishing warning section */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
            Cảnh báo về "Quishing"
          </h4>
          <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
              <div className="space-y-2">
                <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-300">
                  <span className="font-semibold">Quishing</span> là hình thức lừa đảo bằng mã QR
                  giả (kẻ xấu dán đè QR khác lên QR thật) để hướng người dùng tới website độc hại
                  hoặc trang thanh toán giả.
                </p>
                <ul className="space-y-1.5 pl-1 text-sm text-amber-800 dark:text-amber-400">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-amber-600 dark:bg-amber-500" />
                    <span>
                      Luôn kiểm tra domain trong link QR mà hệ thống của bạn tạo ra trước khi in/dán
                      lên bàn.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-amber-600 dark:bg-amber-500" />
                    <span>
                      Định kỳ nhắc nhân viên soát lại QR trên từng bàn để chắc chắn không bị dán đè
                      bởi mã QR lạ.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            className="rounded-full bg-emerald-500 hover:bg-emerald-600"
          >
            Đã hiểu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { Shield, AlertTriangle, CheckCircle2, Eye, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QRSecurityModalProps {
  onClose: () => void
}

export function QRSecurityModal({ onClose }: QRSecurityModalProps) {
  const bestPractices = [
    {
      icon: CheckCircle2,
      text: "Dán QR ở nơi khách dễ thấy nhưng không dễ bị bóc/dán đè.",
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: Eye,
      text: "Nên in kèm số bàn bên cạnh QR để tránh nhầm lẫn giữa các bàn.",
      color: "text-indigo-600 dark:text-indigo-400",
    },
    {
      icon: CheckCircle2,
      text: "Thỉnh thoảng kiểm tra xem QR trên bàn có bị thay thế, hỏng, mờ hay không và thay mới khi cần.",
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: Shield,
      text: "Đảm bảo link QR luôn là domain chính thức của nhà hàng để tránh trường hợp khách bị dẫn sang trang giả mạo.",
      color: "text-emerald-600 dark:text-emerald-400",
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg space-y-6 rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2.5 dark:bg-emerald-500/10">
              <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Lưu ý bảo mật khi sử dụng QR menu
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Thực hành tốt nhất & cảnh báo quan trọng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Best practices section */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Thực hành tốt nhất cho QR menu</h4>
          <div className="space-y-2.5">
            {bestPractices.map((tip, index) => (
              <div key={index} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                <div className={`mt-0.5 flex-shrink-0 ${tip.color}`}>
                  <tip.icon className="h-4 w-4" />
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quishing warning section */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Cảnh báo về "Quishing"</h4>
          <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
              <div className="space-y-2">
                <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-300">
                  <span className="font-semibold">Quishing</span> là hình thức lừa đảo bằng mã QR giả (kẻ xấu dán đè QR
                  khác lên QR thật) để hướng người dùng tới website độc hại hoặc trang thanh toán giả.
                </p>
                <ul className="space-y-1.5 pl-1 text-sm text-amber-800 dark:text-amber-400">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-amber-600 dark:bg-amber-500" />
                    <span>Luôn kiểm tra domain trong link QR mà hệ thống của bạn tạo ra trước khi in/dán lên bàn.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-amber-600 dark:bg-amber-500" />
                    <span>
                      Định kỳ nhắc nhân viên soát lại QR trên từng bàn để chắc chắn không bị dán đè bởi mã QR lạ.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end">
          <Button onClick={onClose} className="rounded-full bg-emerald-500 hover:bg-emerald-600">
            Đã hiểu
          </Button>
        </div>
      </div>
    </div>
  )
}

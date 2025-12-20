"use client"

import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Check, Clock, XCircle, AlertCircle } from "lucide-react"

// Mock data
const MOCK_HISTORY = [
  {
    id: "1",
    from_status: "accepted",
    to_status: "preparing",
    changed_by: "Nguyễn Văn A",
    notes: "Bắt đầu nấu",
    created_at: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: "2",
    from_status: "pending",
    to_status: "accepted",
    changed_by: "Trần Thị B",
    notes: "Đã xác nhận đơn",
    created_at: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: "3",
    from_status: null,
    to_status: "pending",
    changed_by: "Hệ thống",
    notes: "Đơn hàng được tạo",
    created_at: new Date(Date.now() - 18 * 60 * 1000),
  },
]

const STATUS_ICON_MAP: Record<string, any> = {
  pending: Clock,
  accepted: Check,
  preparing: Clock,
  ready: Check,
  served: Check,
  completed: Check,
  rejected: XCircle,
  cancelled: XCircle,
}

const STATUS_COLOR_MAP: Record<string, string> = {
  pending: "bg-slate-500",
  accepted: "bg-purple-500",
  preparing: "bg-amber-500",
  ready: "bg-emerald-500",
  served: "bg-teal-500",
  completed: "bg-slate-500",
  rejected: "bg-red-500",
  cancelled: "bg-red-500",
}

interface OrderStatusTimelineProps {
  orderId: string
}

export function OrderStatusTimeline({ orderId }: OrderStatusTimelineProps) {
  const history = MOCK_HISTORY

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Lịch sử trạng thái</h2>

      <div className="space-y-4">
        {history.map((entry, idx) => {
          const Icon = STATUS_ICON_MAP[entry.to_status] || AlertCircle
          const dotColor = STATUS_COLOR_MAP[entry.to_status] || "bg-slate-500"
          const isLast = idx === history.length - 1

          return (
            <div key={entry.id} className="relative">
              {/* Timeline Line */}
              {!isLast && <div className="absolute top-8 left-4 h-full w-0.5 bg-slate-200 dark:bg-slate-700" />}

              {/* Timeline Item */}
              <div className="flex gap-3">
                {/* Dot Icon */}
                <div
                  className={cn(
                    "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    dotColor,
                  )}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {entry.from_status ? (
                        <>
                          <span className="capitalize">{entry.from_status}</span>
                          <span className="mx-2">→</span>
                          <span className="capitalize">{entry.to_status}</span>
                        </>
                      ) : (
                        <span className="capitalize">{entry.to_status}</span>
                      )}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{entry.notes}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                    <span>{entry.changed_by}</span>
                    <span>•</span>
                    <span>{format(entry.created_at, "HH:mm, dd/MM", { locale: vi })}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

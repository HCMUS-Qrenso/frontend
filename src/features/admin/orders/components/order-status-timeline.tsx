'use client'

import { cn } from '@/src/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Check, Clock, XCircle, AlertCircle } from 'lucide-react'
import type { StatusHistoryEntry } from '../types/orders'

const STATUS_ICON_MAP: Record<string, any> = {
  pending: Clock,
  accepted: Check,
  in_progress: Clock,
  preparing: Clock,
  ready: Check,
  served: Check,
  completed: Check,
  rejected: XCircle,
  cancelled: XCircle,
}

const STATUS_COLOR_MAP: Record<string, string> = {
  pending: 'bg-slate-500',
  accepted: 'bg-purple-500',
  in_progress: 'bg-blue-500',
  preparing: 'bg-amber-500',
  ready: 'bg-emerald-500',
  served: 'bg-teal-500',
  completed: 'bg-slate-500',
  rejected: 'bg-red-500',
  cancelled: 'bg-red-500',
}

// Vietnamese status labels
const STATUS_LABEL_VI: Record<string, string> = {
  pending: 'Chờ xử lý',
  accepted: 'Đã nhận',
  in_progress: 'Đang xử lý',
  preparing: 'Đang chuẩn bị',
  ready: 'Sẵn sàng',
  served: 'Đã phục vụ',
  completed: 'Hoàn thành',
  rejected: 'Từ chối',
  cancelled: 'Đã hủy',
}

// Localize notes that come from backend
const localizeNotes = (notes: string | null): string | null => {
  if (!notes) return null
  const notesMap: Record<string, string> = {
    'Order placed by customer': 'Đơn hàng được đặt bởi khách hàng',
    'Order accepted': 'Đơn hàng đã được nhận',
    'Order completed': 'Đơn hàng hoàn thành',
    'Order cancelled': 'Đơn hàng đã hủy',
    'Order rejected': 'Đơn hàng bị từ chối',
  }
  return notesMap[notes] || notes
}

interface OrderStatusTimelineProps {
  history: StatusHistoryEntry[]
}

export function OrderStatusTimeline({ history }: OrderStatusTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          Lịch sử trạng thái
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có lịch sử</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
        Lịch sử trạng thái
      </h2>

      <div className="space-y-4">
        {history.map((entry, idx) => {
          const Icon = STATUS_ICON_MAP[entry.toStatus] || AlertCircle
          const dotColor = STATUS_COLOR_MAP[entry.toStatus] || 'bg-slate-500'
          const isLast = idx === history.length - 1

          // Get localized status labels
          const fromLabel = entry.fromStatus
            ? STATUS_LABEL_VI[entry.fromStatus] || entry.fromStatus
            : null
          const toLabel = STATUS_LABEL_VI[entry.toStatus] || entry.toStatus
          const localizedNotes = localizeNotes(entry.notes ?? null)

          return (
            <div key={entry.id} className="relative">
              {/* Timeline Line */}
              {!isLast && (
                <div className="absolute top-8 left-4 h-full w-0.5 bg-slate-200 dark:bg-slate-700" />
              )}

              {/* Timeline Item */}
              <div className="flex gap-3">
                {/* Dot Icon */}
                <div
                  className={cn(
                    'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    dotColor,
                  )}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {fromLabel ? (
                        <>
                          <span>{fromLabel}</span>
                          <span className="mx-2">→</span>
                          <span>{toLabel}</span>
                        </>
                      ) : (
                        <span>{toLabel}</span>
                      )}
                    </p>
                  </div>
                  {localizedNotes && (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{localizedNotes}</p>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                    <span>{entry.user?.fullName || 'Hệ thống'}</span>
                    <span>•</span>
                    <span>{format(new Date(entry.createdAt), 'HH:mm, dd/MM', { locale: vi })}</span>
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


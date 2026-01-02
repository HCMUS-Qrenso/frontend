'use client'

import { AlertCircle, StickyNote } from 'lucide-react'

interface OrderNotesProps {
  specialInstructions?: string
  rejectionReason?: string
}

export function OrderNotes({ specialInstructions, rejectionReason }: OrderNotesProps) {
  if (!specialInstructions && !rejectionReason) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Special Instructions */}
      {specialInstructions && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
              <StickyNote className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">
                Ghi chú đơn hàng
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{specialInstructions}</p>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason */}
      {rejectionReason && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm dark:border-red-900/50 dark:bg-red-500/10">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/20">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 font-semibold text-red-900 dark:text-red-400">Lý do từ chối</h3>
              <p className="text-sm text-red-700 dark:text-red-300">{rejectionReason}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

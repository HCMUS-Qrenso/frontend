"use client"

import { AlertCircle, StickyNote } from "lucide-react"

// Mock data
const MOCK_ORDER_NOTES = {
  special_instructions: "Không hành, ít muối",
  rejection_reason: null,
}

interface OrderNotesProps {
  orderId: string
}

export function OrderNotes({ orderId }: OrderNotesProps) {
  const notes = MOCK_ORDER_NOTES

  if (!notes.special_instructions && !notes.rejection_reason) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Special Instructions */}
      {notes.special_instructions && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-500/10">
              <StickyNote className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">Ghi chú đơn hàng</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{notes.special_instructions}</p>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason */}
      {notes.rejection_reason && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm dark:border-red-900/50 dark:bg-red-500/10">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 dark:bg-red-500/20">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 font-semibold text-red-900 dark:text-red-400">Lý do từ chối</h3>
              <p className="text-sm text-red-700 dark:text-red-300">{notes.rejection_reason}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

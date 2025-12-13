"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"

export function TableDeleteDialog() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tableId = searchParams.get("delete")
  const open = !!tableId

  const [isLoading, setIsLoading] = useState(false)

  const closeDialog = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("delete")
    router.push(`/admin/tables/list?${params.toString()}`)
  }

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In production:
      // await fetch(`/api/tables/${tableId}`, { method: 'DELETE' })

      console.log("[v0] Table deleted:", tableId)

      // Close dialog and refresh list
      closeDialog()

      // In production, trigger refresh of table list
      // mutate('/api/tables')
    } catch (error) {
      console.error("[v0] Error deleting table:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={() => !isLoading && closeDialog()}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        aria-describedby="delete-description"
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
      >
        {/* Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>

        {/* Content */}
        <div className="mt-4 text-center">
          <h3 id="delete-title" className="text-lg font-semibold text-slate-900 dark:text-white">
            Xóa bàn này?
          </h3>
          <p id="delete-description" className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Bạn có chắc chắn muốn xóa bàn #{tableId}? Hành động này không thể hoàn tác.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={closeDialog} disabled={isLoading} className="rounded-full">
            Hủy
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isLoading}
            className="gap-2 rounded-full bg-red-600 hover:bg-red-700"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Đang xóa..." : "Xóa bàn"}
          </Button>
        </div>
      </div>
    </>
  )
}

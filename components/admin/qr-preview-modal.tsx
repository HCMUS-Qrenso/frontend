"use client"

import { Button } from "@/components/ui/button"
import { X, Download, Printer, ExternalLink } from "lucide-react"
import Image from "next/image"
import type { TableQR } from "./qr-manager-content"

interface QRPreviewModalProps {
  table: TableQR
  onClose: () => void
}

export function QRPreviewModal({ table, onClose }: QRPreviewModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <Button variant="ghost" size="icon" className="absolute right-4 top-4 rounded-full" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>

        {/* Content */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">QR Code Preview</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Bàn {table.tableNumber} - {table.tableArea}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="rounded-2xl border-4 border-slate-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
              <div className="relative h-64 w-64">
                <Image
                  src={table.qrUrl || "/placeholder.svg"}
                  alt={`QR code for table ${table.tableNumber}`}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Table Info
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Bàn {table.tableNumber} ({table.seats} ghế)
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Target URL
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate text-xs text-slate-600 dark:text-slate-300">{table.qrLink}</code>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" asChild>
                  <a href={table.qrLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-500/10">
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Khách scan QR này sẽ được dẫn thẳng vào menu bàn {table.tableNumber}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2">
            <Button variant="outline" className="gap-2 rounded-full bg-transparent">
              <Download className="h-4 w-4" />
              <span className="text-xs">PNG</span>
            </Button>
            <Button variant="outline" className="gap-2 rounded-full bg-transparent">
              <Download className="h-4 w-4" />
              <span className="text-xs">SVG</span>
            </Button>
            <Button variant="outline" className="gap-2 rounded-full bg-transparent">
              <Download className="h-4 w-4" />
              <span className="text-xs">PDF</span>
            </Button>
          </div>

          <Button className="w-full gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600">
            <Printer className="h-4 w-4" />
            Print QR Code
          </Button>
        </div>
      </div>
    </div>
  )
}

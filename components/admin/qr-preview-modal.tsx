'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, ExternalLink, Loader2 } from 'lucide-react'
import Image from 'next/image'
import type { TableQR } from '@/types/tables'
import { tablesApi } from '@/lib/api/tables'
import { downloadBlob } from '@/lib/utils/download'
import { toast } from 'sonner'
import { useErrorHandler } from '@/hooks/use-error-handler'

interface QRPreviewModalProps {
  table: TableQR
  onClose: () => void
}

export function QRPreviewModal({ table, onClose }: QRPreviewModalProps) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const { handleError } = useErrorHandler()

  const handleDownload = async (format: 'png' | 'pdf') => {
    if (!table.id) return

    setDownloading(format)
    try {
      const blob = await tablesApi.downloadQR(table.id, format)
      const filename = `table-${table.tableNumber}-qr.${format}`
      downloadBlob(blob, filename)
      toast.success(`Đã tải xuống ${format.toUpperCase()}`)
    } catch (error: any) {
      handleError(error, 'Có lỗi xảy ra khi tải xuống QR')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 rounded-full"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Content */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Xem trước mã QR
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Bàn {table.tableNumber} - {table.tableArea}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="rounded-2xl border-4 border-slate-100 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
              <div className="relative h-64 w-64">
                {table.qrUrl ? (
                  <Image
                    src={table.qrUrl}
                    alt={`QR code for table ${table.tableNumber}`}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Image
                      src="/placeholder.svg"
                      alt="QR placeholder"
                      width={120}
                      height={120}
                      className="opacity-50"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <div>
              <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Thông tin bàn
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Bàn {table.tableNumber} ({table.seats} ghế)
              </p>
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                URL đích đến
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate text-xs text-slate-600 dark:text-slate-300">
                  {table.qrLink}
                </code>
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
          <div className="grid grid-cols-2 gap-2">
            <Button
              className="gap-2 rounded-full bg-emerald-500 text-white hover:bg-emerald-600"
              onClick={() => handleDownload('png')}
              disabled={!table.qrUrl || downloading !== null}
            >
              {downloading === 'png' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="text-xs">PNG</span>
            </Button>
            <Button
              className="gap-2 rounded-full bg-indigo-500 text-white hover:bg-indigo-600"
              onClick={() => handleDownload('pdf')}
              disabled={!table.qrUrl || downloading !== null}
            >
              {downloading === 'pdf' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="text-xs">PDF</span>
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}

'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Eye, Download, Printer, RefreshCw, Copy, Check, Loader2, MoreVertical } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import type { TableQR } from '@/types/tables'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface QRTableListProps {
  tables: TableQR[]
  selectedTables: string[]
  onSelectTable: (id: string) => void
  onSelectAll: () => void
  onPreview: (table: TableQR) => void
  onDownload?: (tableId: string, format: 'png' | 'pdf') => void
  onGenerate?: (tableId: string, forceRegenerate: boolean) => void
  onBatchGenerate?: (forceRegenerate: boolean) => void
  onBatchDownload?: (format: 'png' | 'pdf') => void
  isLoading?: boolean
  isDataLoading?: boolean
}

function getStatusBadge(status: TableQR['status']) {
  const statusMap: Record<TableQR['status'], string> = {
    Ready: 'Sẵn sàng',
    Missing: 'Thiếu',
    Outdated: 'Lỗi thời',
  }

  const styles = {
    Ready:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    Missing:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    Outdated:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        styles[status],
      )}
    >
      {statusMap[status]}
    </span>
  )
}

export function QRTableList({
  tables,
  selectedTables,
  onSelectTable,
  onSelectAll,
  onPreview,
  onDownload,
  onGenerate,
  onBatchGenerate,
  onBatchDownload,
  isLoading = false,
  isDataLoading = false,
}: QRTableListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Batch actions */}
      {selectedTables.length > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-500/20 dark:bg-emerald-500/5">
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
            {selectedTables.length} bàn đã chọn
          </span>
          <div className="flex items-center gap-2">
            {onBatchDownload && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-2 rounded-full bg-white dark:bg-slate-900"
                    disabled={isLoading}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Tải xuống
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onBatchDownload('png')}>PNG</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onBatchDownload('pdf')}>PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {onBatchGenerate && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-2 rounded-full bg-white dark:bg-slate-900"
                onClick={() => onBatchGenerate(false)}
                disabled={isLoading}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Tạo lại
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="relative overflow-x-auto rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100 bg-slate-50/80 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900">
              <TableHead className="px-6 py-3 text-left">
                <Checkbox
                  checked={selectedTables.length === tables.length}
                  onCheckedChange={onSelectAll}
                  aria-label="Chọn tất cả"
                />
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Bàn
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Xem trước QR
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Liên kết / Đích đến
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Trạng thái
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Cập nhật lúc
              </TableHead>
              <TableHead className="px-6 py-3 text-right text-xs font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tables.map((table, index) => (
              <TableRow
                key={table.id}
                className={cn(
                  'border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800',
                  index === tables.length - 1 && 'border-b-0',
                )}
              >
                <TableCell className="px-6 py-4">
                  <Checkbox
                    checked={selectedTables.includes(table.id)}
                    onCheckedChange={() => onSelectTable(table.id)}
                    aria-label={`Select table ${table.tableNumber}`}
                  />
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Bàn {table.tableNumber}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{table.tableArea}</p>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  {table.qrUrl ? (
                    <button
                      onClick={() => onPreview(table)}
                      className="group relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200 transition-all hover:scale-105 hover:border-emerald-500 dark:border-slate-700"
                    >
                      <Image
                        src={table.qrUrl}
                        alt={`QR for table ${table.tableNumber}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/60">
                        <Eye className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </button>
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                      <Image
                        src="/placeholder.jpg"
                        alt="QR sắp cập nhật"
                        width={40}
                        height={40}
                        className="object-contain opacity-80"
                      />
                    </div>
                  )}
                </TableCell>
                <TableCell className="px-6 py-4">
                  {table.qrLink ? (
                    <div className="flex items-center gap-2">
                      <code className="max-w-[200px] truncate text-xs text-slate-600 dark:text-slate-400">
                        {table.qrLink}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-md"
                        onClick={() => copyToClipboard(table.qrLink, table.id)}
                      >
                        {copiedId === table.id ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                  )}
                </TableCell>
                <TableCell className="px-6 py-4">{getStatusBadge(table.status)}</TableCell>
                <TableCell className="px-6 py-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{table.updatedAt}</p>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onPreview(table)} disabled={!table.qrUrl}>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem trước
                        </DropdownMenuItem>
                        {onDownload && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onDownload(table.id, 'png')}
                              disabled={!table.qrUrl || isLoading}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Tải xuống PNG
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDownload(table.id, 'pdf')}
                              disabled={!table.qrUrl || isLoading}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Tải xuống PDF
                            </DropdownMenuItem>
                          </>
                        )}
                        {onGenerate && (
                          <DropdownMenuItem
                            onClick={() => onGenerate(table.id, !!table.qrUrl)}
                            disabled={isLoading}
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {table.qrUrl ? 'Tạo lại QR' : 'Tạo QR'}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Loading overlay */}
        {isDataLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              <span className="text-sm text-slate-600 dark:text-slate-300">Đang tải...</span>
            </div>
          </div>
        )}
      </div>

      {/* Table count */}
      {tables.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">Hiển thị {tables.length} bàn</p>
        </div>
      )}
    </div>
  )
}

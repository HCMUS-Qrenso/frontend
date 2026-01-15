'use client'

import { cn } from '@/src/lib/utils'
import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Eye, Download, Printer, RefreshCw, Copy, Check, Loader2, MoreVertical } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { Checkbox } from '@/src/components/ui/checkbox'
import type { TableQR } from '@/src/features/admin/tables/types/tables'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  AdminTableContainer,
  AdminTableHeaderRow,
  AdminTableHead,
  AdminTableRow,
} from '@/src/components/ui/table'
import { useTranslations } from 'next-intl'

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

function StatusBadge({ status, t }: { status: TableQR['status']; t: (key: string) => string }) {
  const statusMap: Record<TableQR['status'], string> = {
    Ready: t('qrStatusReady'),
    Missing: t('qrStatusMissing'),
    Outdated: t('qrStatusOutdated'),
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
  const t = useTranslations('tables')

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
            {t('tablesSelected', { count: selectedTables.length })}
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
                    {t('download')}
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
                {t('regenerate')}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="relative">
        <AdminTableContainer>
          <Table>
            <TableHeader>
              <AdminTableHeaderRow>
                <AdminTableHead>
                  <Checkbox
                    checked={selectedTables.length === tables.length}
                    onCheckedChange={onSelectAll}
                    aria-label={t('selectAllAria')}
                  />
                </AdminTableHead>
                <AdminTableHead>{t('tableCol')}</AdminTableHead>
                <AdminTableHead>{t('qrPreview')}</AdminTableHead>
                <AdminTableHead>{t('linkDestination')}</AdminTableHead>
                <AdminTableHead>{t('status')}</AdminTableHead>
                <AdminTableHead>{t('updatedAtCol')}</AdminTableHead>
                <AdminTableHead align="right">{t('actions')}</AdminTableHead>
              </AdminTableHeaderRow>
            </TableHeader>
            <TableBody>
              {tables.map((table, index) => (
                <AdminTableRow key={table.id} isLast={index === tables.length - 1}>
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
                        {t('tableCol')} {table.tableNumber}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {table.tableArea}
                      </p>
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
                          alt="QR placeholder"
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
                  <TableCell className="px-6 py-4">
                    <StatusBadge status={table.status} t={t} />
                  </TableCell>
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
                          <DropdownMenuItem
                            onClick={() => onPreview(table)}
                            disabled={!table.qrUrl}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            {t('preview')}
                          </DropdownMenuItem>
                          {onDownload && (
                            <>
                              <DropdownMenuItem
                                onClick={() => onDownload(table.id, 'png')}
                                disabled={!table.qrUrl || isLoading}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                {t('downloadPng')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onDownload(table.id, 'pdf')}
                                disabled={!table.qrUrl || isLoading}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                {t('downloadPdf')}
                              </DropdownMenuItem>
                            </>
                          )}
                          {onGenerate && (
                            <DropdownMenuItem
                              onClick={() => onGenerate(table.id, !!table.qrUrl)}
                              disabled={isLoading}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              {table.qrUrl ? t('regenerateQr') : t('generateQrAction')}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </AdminTableRow>
              ))}
            </TableBody>
          </Table>
        </AdminTableContainer>

        {/* Loading overlay */}
        {isDataLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              <span className="text-sm text-slate-600 dark:text-slate-300">{t('loading')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Table count */}
      {tables.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('showingTables', { count: tables.length })}
          </p>
        </div>
      )}
    </div>
  )
}

"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, Download, Printer, RefreshCw, Copy, Check } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import type { TableQR } from "./qr-manager-content"
import { Checkbox } from "@/components/ui/checkbox"

interface QRTableListProps {
  tables: TableQR[]
  selectedTables: string[]
  onSelectTable: (id: string) => void
  onSelectAll: () => void
  onPreview: (table: TableQR) => void
}

function getStatusBadge(status: TableQR["status"]) {
  const styles = {
    Ready:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    Missing: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
    Outdated:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  }

  return (
    <span
      className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", styles[status])}
    >
      {status}
    </span>
  )
}

export function QRTableList({ tables, selectedTables, onSelectTable, onSelectAll, onPreview }: QRTableListProps) {
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
            <Button size="sm" variant="outline" className="h-8 gap-2 rounded-full bg-white dark:bg-slate-900">
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
            <Button size="sm" variant="outline" className="h-8 gap-2 rounded-full bg-white dark:bg-slate-900">
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
            <Button size="sm" variant="outline" className="h-8 gap-2 rounded-full bg-white dark:bg-slate-900">
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900">
              <th className="px-6 py-3 text-left">
                <Checkbox
                  checked={selectedTables.length === tables.length}
                  onCheckedChange={onSelectAll}
                  aria-label="Select all"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Table
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                QR Preview
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Link / Target
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Updated At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tables.map((table, index) => (
              <tr
                key={table.id}
                className={cn(
                  "border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800",
                  index === tables.length - 1 && "border-b-0",
                )}
              >
                <td className="px-6 py-4">
                  <Checkbox
                    checked={selectedTables.includes(table.id)}
                    onCheckedChange={() => onSelectTable(table.id)}
                    aria-label={`Select table ${table.tableNumber}`}
                  />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Bàn {table.tableNumber}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{table.tableArea}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {table.qrUrl ? (
                    <button
                      onClick={() => onPreview(table)}
                      className="group relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200 transition-all hover:scale-105 hover:border-emerald-500 dark:border-slate-700"
                    >
                      <Image
                        src={table.qrUrl || "/placeholder.svg"}
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
                      <span className="text-xs text-slate-400">No QR</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
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
                </td>
                <td className="px-6 py-4">{getStatusBadge(table.status)}</td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{table.updatedAt}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => onPreview(table)}
                      disabled={!table.qrUrl}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled={!table.qrUrl}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Download PNG</DropdownMenuItem>
                        <DropdownMenuItem>Download SVG</DropdownMenuItem>
                        <DropdownMenuItem>Download PDF</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled={!table.qrUrl}>
                      <Printer className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">Hiển thị 1-10 trên {tables.length} bàn</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full bg-transparent" disabled>
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10"
          >
            1
          </Button>
          <Button variant="outline" size="sm" className="rounded-full bg-transparent">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
